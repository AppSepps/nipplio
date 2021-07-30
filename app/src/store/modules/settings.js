import firebase from 'firebase'
import axios from 'axios'

function initialState() {
    return {
        windowToggleShortCut: 'CommandOrControl+P',
        selfMuteShortCut: 'CommandOrControl+Alt+O',
        discoveredDevices: [],
    }
}

const getters = {}

const actions = {
    async addDeviceToCurrentBoard({ dispatch, rootState }, ipAddress) {
        console.log(rootState.app.activeBoard.id)
        console.log(ipAddress)
        const url =
            'http://' +
            ipAddress +
            '/setBoardId?boardId=' +
            rootState.app.activeBoard.id
        const response = await axios.get(url)
        console.log(response)
        await dispatch('getDeviceConfig', ipAddress)
    },
    async addSoundMappingToDevice({ dispatch, rootState }, ipAddress) {
        console.log(rootState.app.sounds)
        console.log(ipAddress)
        const url = 'http://' + ipAddress + '/setSlotSoundMapping'
        const soundsIdsArray = rootState.app.sounds.map((sound) => sound.id)
        const response = await axios.post(url, soundsIdsArray.slice(0, 5))
        console.log(response)
        await dispatch('getDeviceConfig', ipAddress)
    },
    async loginOnDevice({ dispatch, commit }, ipAddress) {
        console.log(commit)
        console.log(ipAddress)

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
            console.log(url)
            const response = await axios.get(url)
            console.log(response.data)

            await dispatch('getDeviceConfig', ipAddress)
        } catch (error) {
            commit('setDeviceFinishedLoading', ipAddress)
        }
        commit('setDeviceFinishedLoading', ipAddress)
    },
    async getDeviceConfig({ commit }, ipAddress) {
        // Get the config of the device
        const configUrl = 'http://' + ipAddress + '/getConfig'
        console.log(configUrl)
        const configResponse = await axios.get(configUrl)
        console.log(configResponse.data)
        commit('setDeviceConfig', { ipAddress, config: configResponse.data })
    },
    async resetDeviceList(action) {
        action.commit('resetDeviceList')
    },
    async discoveredNipplioDevice({ dispatch, commit, state }, service) {
        if (service) {
            const foundItem = state.discoveredDevices.filter(
                (device) => device.addresses[0] === service.addresses[0]
            )
            if (foundItem && foundItem.length === 0) {
                commit('discoveredNipplioDevice', { service })
            } else {
                await dispatch('getDeviceConfig', service.addresses[0])
            }
        }
    },
    async registerWindowToggleShortCut(action, params) {
        const { shortCut } = params
        action.commit('registerWindowToggleShortCut', { shortCut })
    },
    async registerSelfMuteShortCut(action, params) {
        const { shortCut } = params
        action.commit('registerSelfMuteShortCut', { shortCut })
    },
}

const mutations = {
    setDeviceConfig(state, { ipAddress, config }) {
        state.discoveredDevices.forEach((device) => {
            if (device.addresses.includes(ipAddress)) {
                device.config = config
            }
        })
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
    resetDeviceList(state) {
        state.discoveredDevices = []
    },
    registerWindowToggleShortCut(state, { shortCut }) {
        state.windowToggleShortCut = shortCut
    },
    registerSelfMuteShortCut(state, { shortCut }) {
        state.selfMuteShortCut = shortCut
    },
    discoveredNipplioDevice(state, { service }) {
        state.discoveredDevices.push(service)
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
