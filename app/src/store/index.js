import { createStore, createLogger } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import app from './modules/app'
import board from './modules/board'
import settings from './modules/settings'
import sound from './modules/sound'

const persistedAppState = createPersistedState({
    paths: ['board.activeBoard', 'app.user', 'sound.selfMute', 'sound.volume'],
})

const store = createStore({
    modules: {
        app,
        board,
        settings,
        sound,
    },
    actions: {
        clearAll({ commit }) {
            commit('app/reset')
            commit('board/reset')
            commit('settings/reset')
            commit('sound/reset')
        },
    },
    plugins: [createLogger(), persistedAppState],
})

export default store
