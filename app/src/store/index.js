import { createStore, createLogger } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import board from './modules/board'
import player from './modules/player'
import settings from './modules/settings'
import sound from './modules/sound'
import user from './modules/user'

const persistedAppState = createPersistedState({
    paths: [
        'board.activeBoard',
        'player.volume',
        'sound.selfMute',
        'user.user',
        'user.mutedUsers',
    ],
})

const store = createStore({
    modules: {
        board,
        player,
        settings,
        sound,
        user,
    },
    actions: {
        clearAll({ commit }) {
            commit('board/reset')
            commit('playr/reset')
            commit('settings/reset')
            commit('sound/reset')
            commit('user/reset')
        },
    },
    plugins: [createLogger(), persistedAppState],
})

export default store
