import { createStore, createLogger } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import app from './modules/app'
import settings from './modules/settings'

const persistedAppState = createPersistedState({
    paths: [
        'app.activeBoard',
        'app.user',
        'app.selfMute',
        'app.volume',
        'settings',
    ],
})

const store = createStore({
    modules: {
        app,
        settings,
    },
    plugins: [createLogger(), persistedAppState],
})

export default store
