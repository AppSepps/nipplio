import { createStore, createLogger } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import app from './modules/app'
import board from './modules/board'
import settings from './modules/settings'

const persistedAppState = createPersistedState({
    paths: ['board.activeBoard', 'app.user', 'app.selfMute', 'app.volume'],
})

const store = createStore({
    modules: {
        app,
        board,
        settings,
    },
    actions: {
        clearAll({ commit }) {
            commit('app/reset')
            commit('board/reset')
            commit('settings/reset')
        },
    },
    plugins: [createLogger(), persistedAppState],
})

export default store
