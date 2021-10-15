import firebase from 'firebase'
import axios from 'axios'
import {v4 as uuidv4} from 'uuid'
import hotkeys from "hotkeys-js";
import {sendToIPCRenderer} from "@/helpers/electron.helper";

function initialState() {
    return {
        openShortcutText: "",
        openShortcutRecording: false,
        availableSlotSounds: [],
        discoveredDevices: [],
        remoteDevices: [],
        bluetoothDevice: null,
    }
}

const getters = {
    openShortcutRecording: function (state) {
        return state.openShortcutRecording
    },
    isOwner: function (state, getters, rootState) {
        return (
            rootState.board.activeBoard.owner ===
            firebase.auth().currentUser.uid
        )
    },
    apiKeys: function (state, getters, rootState) {
        return rootState.board.apiKeys
    },
    remoteDevices: function (state) {
        return state.remoteDevices.map(remoteDevice => {
            let ipAddress
            state.discoveredDevices.forEach(discoveredDevice => {
                if (discoveredDevice.name === remoteDevice.id) {
                    ipAddress = discoveredDevice.addresses[0]
                }
            })
            return {
                ...remoteDevice,
                ipAddress,
            }
        })
    },
    filteredDiscoveredDevices: state =>
        state.discoveredDevices.filter(dd => {
            const remoteDevices = state.remoteDevices.filter(
                rd => rd.id === dd.name
            )
            return remoteDevices.length === 0
        }),
}

const actions = {
    toggleOpenShortcutRecording({commit, state, dispatch}) {
        if (state.openShortcutRecording) {
            // unregister the hotkey
            hotkeys.unbind('*', 'openShortcut')
            hotkeys.setScope('all')
            sendToIPCRenderer('sendOpenShortcutToRenderer')
        } else {
            // register hotkeys
            hotkeys('*', 'openShortcut', async function (event) {
                console.log(event)
                let electronArray = [];
                let containsModifierKey = false
                let containsKey = false
                if (event.metaKey) {
                    electronArray.push("Meta")
                    containsModifierKey = true
                }
                if (event.ctrlKey) {
                    electronArray.push("Ctrl")
                    containsModifierKey = true
                }
                if (event.shiftKey) {
                    electronArray.push("Shift")
                    containsModifierKey = true
                }
                if (event.altKey) {
                    electronArray.push("Alt")
                    containsModifierKey = true
                }
                if (event.key.match(/^[a-zA-Z]$/)) {
                    electronArray.push(event.key.toUpperCase())
                    containsKey = true
                }
                dispatch('openShortcutTextChanged', {
                    text: electronArray.join(' + '),
                })
                if (containsModifierKey && containsKey) {
                    sendToIPCRenderer('changeOpenShortcut', electronArray.join('+'))
                }
            })
            hotkeys.setScope('openShortcut')
        }
        commit('setOpenShortcutRecording', !state.openShortcutRecording)
    },
    openShortcutTextChanged({commit}, params) {
        const {text} = params
        commit('changeOpenShortcutText', {text})
    },
    async addApiKey({rootState}) {
        await firebase
            .database()
            .ref(`/apiKeys/${rootState.board.activeBoard.id}/${uuidv4()}`)
            .set(true)
    },
    async deleteApiKey({rootState}, apiKey) {
        await firebase
            .database()
            .ref(`/apiKeys/${rootState.board.activeBoard.id}/${apiKey}`)
            .set(null)
    },
    async bleButtonScanClicked({dispatch}) {
        try {
            console.log('Requesting any Bluetooth Device...')
            this.bluetoothDevice = await navigator.bluetooth.requestDevice({
                optionalServices: ['b06396cd-dfc3-495e-b33e-4a4c3b86389d'],
                filters: [
                    {
                        namePrefix: 'Nipplio',
                    },
                ],
                // filters: [...] <- Prefer filters to save energy & show relevant devices.
            })
            //commit('setBluetoothDevice', bluetoothDevice)
            dispatch('autoConnect')
            //connect()
        } catch (error) {
            console.log('Argh! ' + error)
        }
    },
    async autoConnect({dispatch}) {
        const devices = await navigator.bluetooth.getDevices()
        console.log(devices)
        if (devices !== undefined && devices.length > 0) {
            this.bluetoothDevice = devices[0]
        }
        if (this.bluetoothDevice === undefined) {
            console.log('bluetooth device not found')
            return
        }
        this.bluetoothDevice.addEventListener(
            'gattserverdisconnected',
            function onDisconect() {
                dispatch('onDisconnected')
            }
        )
        console.log('Connecting to GATT Server...')
        const server = await this.bluetoothDevice.gatt.connect()
        console.log(server)
        console.log('Getting Service...')
        const service = await server.getPrimaryService(
            'b06396cd-dfc3-495e-b33e-4a4c3b86389d'
        )

        console.log('Getting Characteristic...')
        const myCharacteristic = await service.getCharacteristic(
            '4be2fa7d-5c30-409d-b042-87466d4127d2'
        )

        const slotCharacteristic = await service.getCharacteristic(
            'db7612a8-737d-4ca3-8d5f-8a56ce58b7ad'
        )
        const slotsRaw = await slotCharacteristic.readValue()
        const slots = JSON.parse(new TextDecoder().decode(slotsRaw))
        console.log(slots)
        // Write Slot mapping to firebase
        await firebase
            .database()
            .ref(
                `users/${firebase.auth().currentUser.uid}/remoteDevices/${
                    this.bluetoothDevice.name
                }/slots`
            )
            .set(slots)

        await myCharacteristic.startNotifications()

        console.log('> Notifications started')
        myCharacteristic.addEventListener(
            'characteristicvaluechanged',
            function (event) {
                dispatch('handleNotifications', event)
            }
        )
    },
    handleNotifications({dispatch}, event) {
        let value = event.target.value
        console.log(event.currentTarget.service.device.name)
        console.log(event.currentTarget.service.device.id)
        // Convert raw data bytes to hex values just for the sake of showing something.
        // In the "real" world, you'd use data.getUint8, data.getUint16 or even
        // TextDecoder to process raw data bytes.
        const slotPressed = value.getUint8(0).toString()
        console.log(slotPressed)
        dispatch(
            'player/triggerRemotePlaySound',
            {
                slotId: slotPressed,
                deviceId: event.currentTarget.service.device.name,
            },
            {root: true}
        )
    },
    async triggerRemotePlaySoundBySlotIdAndBoardId() {
    },
    async onDisconnect() {
        console.log('onDisconnect')
    },
    async addSoundMappingToDevice({dispatch, rootState}, ipAddress) {
        const url = 'http://' + ipAddress + '/setSlotSoundMapping'
        const soundsIdsArray = rootState.sound.sounds.map(sound => sound.id)
        await axios.post(url, soundsIdsArray.slice(0, 5))
        await dispatch('getDeviceConfig', ipAddress)
    },
    async getAvailableSlotSounds({commit}, {boardId}) {
        try {
            const sounds = await firebase
                .database()
                .ref(`sounds/${boardId}`)
                .once('value')
            commit('addAvailableSlotSounds', sounds.val())
        } catch (error) {
            console.log(error)
        }
    },
    async registerRemoteDevice({dispatch, commit}, ipAddress) {
        commit('setDeviceLoading', ipAddress)
        try {
            const idToken = await firebase.auth().currentUser.getIdToken()
            const createAndReturnAuthToken = firebase
                .functions()
                .httpsCallable('createAndReturnAuthToken')
            const result = await createAndReturnAuthToken({
                'id-token': idToken,
            })

            // Login with the customToken
            const url =
                'http://' +
                ipAddress +
                '/loginWithCustomToken?customToken=' +
                result.data.token
            await axios.get(url)

            await dispatch('getDeviceConfig', ipAddress)
        } catch (error) {
            commit('setDeviceFinishedLoading', ipAddress)
        }
        commit('setDeviceFinishedLoading', ipAddress)
    },
    async getDeviceConfig(context, ipAddress) {
        const configUrl = 'http://' + ipAddress + '/getConfig'
        const configResponse = await axios.get(configUrl)
        console.log(configResponse.data)
    },
    async discoveredNipplioDevice({dispatch, commit, state}, device) {
        if (device) {
            const discoveredDevice = state.discoveredDevices.filter(
                d => d.addresses[0] === device.addresses[0]
            )[0]
            if (!discoveredDevice) {
                commit('addDiscoveredDevice', {device})
            } else {
                // Do we need this?
                await dispatch('getDeviceConfig', device.addresses[0])
            }
        }
    },
    async saveSlotMapping(context, {device, boardId, selectedSounds}) {
        const slotMappingRef = firebase
            .database()
            .ref(
                `/users/${firebase.auth().currentUser.uid}/remoteDevices/${
                    device.id
                }/${boardId}/slots`
            )
        try {
            const slotMapping = {}
            device.slots.forEach((slot, index) => {
                slotMapping[index] = selectedSounds[index]
                    ? selectedSounds[index].id
                    : null
            })
            await slotMappingRef.set(slotMapping)
        } catch (error) {
            console.log(error)
        }
    },
    subscribeToRemoteDevices({commit}) {
        const user = firebase.auth().currentUser
        const deviceRef = firebase
            .database()
            .ref(`/users/${user.uid}/remoteDevices`)

        deviceRef.on('child_added', snapshot => {
            commit('addRemoteDevice', {
                id: snapshot.key,
                ...snapshot.val(),
            })
        })

        deviceRef.on('child_changed', snapshot => {
            commit('changeRemoteDevice', {
                id: snapshot.key,
                ...snapshot.val(),
            })
        })

        deviceRef.on('child_removed', snapshot => {
            commit('removeRemoteDevice', {
                id: snapshot.key,
            })
        })
    },
    async unlinkRemoteDevice({commit}, device) {
        console.log(device)
        commit('setRemoteDeviceLoadingStatus', {device, isLoading: true})
        const idToken = await firebase.auth().currentUser.getIdToken()
        const url =
            'http://' + device.ipAddress + '/unpairDevice?idToken=' + idToken
        try {
            await axios.get(url)
            const user = firebase.auth().currentUser
            await firebase
                .database()
                .ref(`/users/${user.uid}/remoteDevices/${device.id}`)
                .remove()
        } catch (error) {
            console.log(error)
        }
        commit('setRemoteDeviceLoadingStatus', {device, isLoading: false})
    },
}

const mutations = {
    setOpenShortcutRecording(state, newState) {
        state.openShortcutRecording = newState;
    },
    changeOpenShortcutText(state, {text}) {
        state.openShortcutText = text;
    },
    setBluetoothDevice(state, bluetoothDevice) {
        state.bluetoothDevice = bluetoothDevice
    },
    addAvailableSlotSounds(state, sounds) {
        let availableSounds = []
        for (let [key, value] of Object.entries(sounds)) {
            availableSounds.push({id: key, ...value})
        }
        availableSounds = availableSounds.sort((a, b) =>
            a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        )
        state.availableSlotSounds = availableSounds
    },
    addRemoteDevice(state, device) {
        state.remoteDevices.push(device)
    },
    changeRemoteDevice(state, device) {
        state.remoteDevices = state.remoteDevices.map(d => {
            return d.id === device.id ? device : d
        })
    },
    removeRemoteDevice(state, {id}) {
        state.remoteDevices = state.remoteDevices.filter(
            device => device.id !== id
        )
    },
    setRemoteDeviceLoadingStatus(state, {device, isLoading}) {
        state.remoteDevices.forEach(remoteDevice => {
            if (device.id === remoteDevice.id) {
                remoteDevice.loading = isLoading
            }
        })
    },
    setDeviceLoading(state, ipAddress) {
        state.discoveredDevices.forEach(device => {
            if (device.addresses.includes(ipAddress)) {
                device.loading = true
            }
        })
    },
    setDeviceFinishedLoading(state, ipAddress) {
        state.discoveredDevices.forEach(device => {
            if (device.addresses.includes(ipAddress)) {
                device.loading = false
            }
        })
    },
    addDiscoveredDevice(state, {device}) {
        state.discoveredDevices.push(device)
    },
    reset(state) {
        const s = initialState()
        Object.keys(s).forEach(key => {
            state[key] = s[key]
        })
    },
}

export default {
    namespaced: true,
    state: initialState,
    getters,
    actions,
    mutations,
}
