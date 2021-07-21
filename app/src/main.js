import { createApp } from 'vue'
import firebase from 'firebase'
import { Quasar } from 'quasar'
import mitt from 'mitt'
import quasarConfig from './quasar.conf'
import store from './store'
import router from './router'
import App from './App.vue'
import config from './config'

firebase.initializeApp(config)
if (location.hostname === 'localhost') {
    firebase.auth().useEmulator('http://localhost:9099')
    firebase.database().useEmulator('localhost', 9000)
    firebase.storage().useEmulator('localhost', 9199)
    firebase.functions().useEmulator('localhost', 5001)
}

let app
firebase.auth().onAuthStateChanged(() => {
    if (!app) {
        const bus = mitt()

        app = createApp(App)
        app.config.globalProperties.bus = bus
        app.use(store)
        app.use(Quasar, quasarConfig)
        app.use(router)
        app.mount('#app')
    }
})

try {
    window.ipcRenderer.on('mute', async () => {
        await store.dispatch('app/toggleSelfMute')
    })
} catch (error) {
    console.log(error)
}
