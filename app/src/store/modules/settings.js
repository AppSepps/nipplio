import firebase from 'firebase'
import axios from 'axios'
import serial from '../../helpers/serial'
import { USB } from 'webusb'
import { v4 as uuidv4 } from 'uuid'

const usb = new USB()
function initialState() {
    return {
        availableSlotSounds: [],
        discoveredDevices: [],
        remoteDevices: [],
        detectedGamepads: [],
    }
}

const getters = {
    isOwner: function(state, getters, rootState) {
        return (
            rootState.board.activeBoard.owner ===
            firebase.auth().currentUser.uid
        )
    },
    apiKeys: function(state, getters, rootState) {
        return rootState.board.apiKeys
    },
    detectedGamepads: function(state) {
        return state.detectedGamepads
    },
    remoteDevices: function(state) {
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
    async gamepadButtonPressed({ dispatch }, { gamepad, index }) {
        console.log(gamepad, index)
        dispatch(
            'player/triggerRemotePlaySound',
            { deviceId: gamepad.id, slotId: index },
            { root: true }
        )
    },
    async gamepadDisconnected({ commit }, event) {
        commit('removeDetectedGamepad', event.gamepad)
    },
    async gamepadConnected({ commit }, event) {
        commit('addDetectedGamepad', event.gamepad)
    },
    async registerUSBDevice(context, usbDevice) {
        let slots = {
            '0': 'Button 1',
            '1': 'Button 2',
            '2': 'Button 3',
            '3': 'Button 4',
            '4': 'Button 5',
            '5': 'Button 6',
            '6': 'Button 7',
        }
        await firebase
            .database()
            .ref(
                `users/${firebase.auth().currentUser.uid}/remoteDevices/${
                    usbDevice.serialNumber
                }/slots`
            )
            .set(slots)
    },
    async addApiKey({ rootState }) {
        await firebase
            .database()
            .ref(`/apiKeys/${rootState.board.activeBoard.id}/${uuidv4()}`)
            .set(true)
    },
    async deleteApiKey({ rootState }, apiKey) {
        await firebase
            .database()
            .ref(`/apiKeys/${rootState.board.activeBoard.id}/${apiKey}`)
            .set(null)
    },
    async bleButtonScanClicked({ dispatch }) {
        try {
            console.log('Requesting USB Devices')
            const usbDevice = await usb.requestDevice({
                optionalServices: ['b06396cd-dfc3-495e-b33e-4a4c3b86389d'],
                filters: [
                    {
                        vendorId: '9025',
                    },
                ],
                // filters: [...] <- Prefer filters to save energy & show relevant devices.
            })
            console.log(usbDevice)
            await dispatch('connectToUSBDevice', usbDevice)
            //commit('setUsbDevice', usbDevice)
            //dispatch('autoConnect')
            //connect()
        } catch (error) {
            console.log('Argh! ' + error)
        }
    },
    async connectToUSBDevice({ dispatch }, usbDevice) {
        const port = new serial.Port(usbDevice)
        port.connect().then(() => {
            port.onReceive = async data => {
                const slotId = new TextDecoder().decode(data)
                console.log(slotId)
                await dispatch(
                    'player/triggerRemotePlaySound',
                    {
                        deviceId: usbDevice.serialNumber,
                        slotId,
                    },
                    { root: true }
                )
            }
        })
    },
    async autoConnect({ dispatch }) {
        usb.addEventListener('connect', async event => {
            // Add event.device to the UI.
            console.log('connected device: ', event)
            await dispatch('connectToUSBDevice', event.device)
        })
        const devices = await usb.getDevices()
        console.log('usb.getDevices()', devices)
        if (devices.length > 0) {
            await dispatch('connectToUSBDevice', devices[0])
        }
    },
    handleNotifications({ dispatch }, event) {
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
            { root: true }
        )
    },
    async triggerRemotePlaySoundBySlotIdAndBoardId() {},
    async onDisconnect() {
        console.log('onDisconnect')
    },
    async addSoundMappingToDevice({ dispatch, rootState }, ipAddress) {
        const url = 'http://' + ipAddress + '/setSlotSoundMapping'
        const soundsIdsArray = rootState.sound.sounds.map(sound => sound.id)
        await axios.post(url, soundsIdsArray.slice(0, 5))
        await dispatch('getDeviceConfig', ipAddress)
    },
    async getAvailableSlotSounds({ commit }, { boardId }) {
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
    async registerRemoteDevice({ dispatch, commit }, ipAddress) {
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
    async discoveredNipplioDevice({ dispatch, commit, state }, device) {
        if (device) {
            const discoveredDevice = state.discoveredDevices.filter(
                d => d.addresses[0] === device.addresses[0]
            )[0]
            if (!discoveredDevice) {
                commit('addDiscoveredDevice', { device })
            } else {
                // Do we need this?
                await dispatch('getDeviceConfig', device.addresses[0])
            }
        }
    },
    async saveSlotMapping(context, { device, boardId, selectedSounds }) {
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
    subscribeToRemoteDevices({ commit }) {
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
    async unlinkRemoteDevice({ commit }, device) {
        console.log(device)
        commit('setRemoteDeviceLoadingStatus', { device, isLoading: true })
        const idToken = await firebase.auth().currentUser.getIdToken()
        try {
            const url =
                'http://' +
                device.ipAddress +
                '/unpairDevice?idToken=' +
                idToken
            if (device.ipAddress !== undefined) {
                // is HTTP Client. Otherwise it is probably a gamepad
                await axios.get(url)
            }
            const user = firebase.auth().currentUser
            await firebase
                .database()
                .ref(`/users/${user.uid}/remoteDevices/${device.id}`)
                .remove()
        } catch (error) {
            console.log(error)
        }
        commit('setRemoteDeviceLoadingStatus', { device, isLoading: false })
    },
}

const mutations = {
    addDetectedGamepad(state, gamepad) {
        state.detectedGamepads.push(gamepad)
    },
    removeDetectedGamepad(state, gamepad) {
        state.detectedGamepads.splice(
            state.detectedGamepads.indexOf(gamepad),
            1
        )
    },
    setUsbDevice(state, usbDevice) {
        state.usbDevice = usbDevice
    },
    addAvailableSlotSounds(state, sounds) {
        let availableSounds = []
        for (let [key, value] of Object.entries(sounds)) {
            availableSounds.push({ id: key, ...value })
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
    removeRemoteDevice(state, { id }) {
        state.remoteDevices = state.remoteDevices.filter(
            device => device.id !== id
        )
    },
    setRemoteDeviceLoadingStatus(state, { device, isLoading }) {
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
    addDiscoveredDevice(state, { device }) {
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
