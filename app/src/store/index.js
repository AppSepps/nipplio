import { createStore, createLogger } from 'vuex'
import app from './modules/app'

const store = createStore({
    modules: {
        app,
    },
    plugins: [createLogger()],
})

export default store
