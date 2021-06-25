import { createStore, createLogger } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import app from './modules/app'

const persistedAppState = createPersistedState({
    paths: ['app'],
})

const store = createStore({
    modules: {
        app,
    },
    plugins: [createLogger(), persistedAppState],
})

export default store
