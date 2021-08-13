import firebase from 'firebase'
import axios from 'axios'

function initialState() {
    return {
        remoteDevices: [],
        discoveredDevices: [],
        availableSlotSounds: [],
    }
}

const getters = {
    filteredDiscoveredDevices: (state) =>
        state.discoveredDevices.filter((dd) => {
            const remoteDevices = state.remoteDevices.filter(
                (rd) => rd.id === dd.name
            )
            return remoteDevices.length === 0
        }),
}

const actions = {
    async addSoundMappingToDevice({ dispatch, rootState }, ipAddress) {
        const url = 'http://' + ipAddress + '/setSlotSoundMapping'
        const soundsIdsArray = rootState.sound.sounds.map((sound) => sound.id)
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
                (d) => d.addresses[0] === device.addresses[0]
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

        deviceRef.on('child_added', (snapshot) => {
            commit('addRemoteDevice', {
                id: snapshot.key,
                ...snapshot.val(),
            })
        })

        deviceRef.on('child_changed', (snapshot) => {
            commit('changeRemoteDevice', {
                id: snapshot.key,
                ...snapshot.val(),
            })
        })

        deviceRef.on('child_removed', (snapshot) => {
            commit('removeRemoteDevice', {
                id: snapshot.key,
            })
        })
    },
    unlinkRemoteDevice(context, id) {
        console.log(id)
    },
}

const mutations = {
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
        state.remoteDevices = state.remoteDevices.map((d) => {
            return d.id === device.id ? device : d
        })
    },
    removeRemoteDevice(state, { id }) {
        state.remoteDevices = state.remoteDevices.filter(
            (device) => device.id !== id
        )
    },
    setDeviceLoading(state, ipAddress) {
        state.discoveredDevices.forEach((device) => {
            if (device.addresses.includes(ipAddress)) {
                device.loading = true
            }
        })
    },
    setDeviceFinishedLoading(state, ipAddress) {
        state.discoveredDevices.forEach((device) => {
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
        Object.keys(s).forEach((key) => {
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
