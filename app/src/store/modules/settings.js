function initialState() {
    return {
        windowToggleShortCut: 'CommandOrControl+P',
        selfMuteShortCut: 'CommandOrControl+Alt+O',
        discoveredDevices: [],
    }
}

const getters = {}

const actions = {
    async resetDeviceList(action) {
        action.commit('resetDeviceList')
    },
    async discoveredNipplioDevice({ commit, state }, service) {
        if (service) {
            const foundItem = state.discoveredDevices.filter(
                device => device.addresses[0] === service.addresses[0]
            )
            if (foundItem && foundItem.length === 0) {
                commit('discoveredNipplioDevice', { service })
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
}

export default {
    namespaced: true,
    state: initialState,
    getters,
    actions,
    mutations,
}
