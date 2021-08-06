import firebase from 'firebase'
import axios from 'axios'

function initialState() {
    return {
        discoveredDevices: [],
    }
}

const getters = {}

const actions = {
    async addSoundMappingToDevice({ dispatch, rootState }, ipAddress) {
        const url = 'http://' + ipAddress + '/setSlotSoundMapping'
        const soundsIdsArray = rootState.sound.sounds.map((sound) => sound.id)
        await axios.post(url, soundsIdsArray.slice(0, 5))
        await dispatch('getDeviceConfig', ipAddress)
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
            const foundItem = state.discoveredDevices.filter(
                (device) => device.addresses[0] === device.addresses[0]
            )
            if (foundItem && foundItem.length === 0) {
                commit('addDiscoveredDevice', { device })
            } else {
                await dispatch('getDeviceConfig', device.addresses[0])
            }
        }
    },
}

const mutations = {
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
