import { createStore, createLogger } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import board from './modules/board'
import settings from './modules/settings'
import sound from './modules/sound'
import user from './modules/user'

const persistedAppState = createPersistedState({
    paths: [
        'board.activeBoard',
        'sound.selfMute',
        'sound.volume',
        'user.user',
        'user.mutedUsers',
    ],
})

const store = createStore({
    modules: {
        board,
        settings,
        sound,
        user,
    },
    actions: {
        clearAll({ commit }) {
            commit('board/reset')
            commit('settings/reset')
            commit('sound/reset')
            commit('user/reset')
        },
    },
    plugins: [createLogger(), persistedAppState],
})

export default store
