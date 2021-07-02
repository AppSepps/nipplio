function initialState() {
    return {
        windowToggleShortCut: 'CommandOrControl+P',
        selfMuteShortCut: 'CommandOrControl+Alt+O',
    }
}

const getters = {}

const actions = {
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
    registerWindowToggleShortCut(state, { shortCut }) {
        state.windowToggleShortCut = shortCut
    },
    registerSelfMuteShortCut(state, { shortCut }) {
        state.selfMuteShortCut = shortCut
    },
}

export default {
    namespaced: true,
    state: initialState,
    getters,
    actions,
    mutations,
}
