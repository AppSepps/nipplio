import { createStore, createLogger } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import board from './modules/board'
import player from './modules/player'
import settings from './modules/settings'
import sound from './modules/sound'
import theme from './modules/theme'
import user from './modules/user'
import remoteDevices from './modules/remoteDevices'

const persistedAppState = createPersistedState({
    paths: [
        'board.activeBoard',
        'player.volume',
        'sound.favoriteSoundIds',
        'theme.currentThemeId',
        'user.mutedUsers',
        'user.speaker',
        'user.user',
        'settings.bluetoothDevice',
        'remoteDevices.remoteDevices',
    ],
})

const store = createStore({
    modules: {
        board,
        player,
        settings,
        sound,
        theme,
        user,
        remoteDevices,
    },
    actions: {
        clearAll({ commit }) {
            commit('board/reset')
            commit('player/reset')
            commit('settings/reset')
            commit('sound/reset')
            commit('user/reset')
        },
    },
    plugins: [createLogger(), persistedAppState],
})

export default store
