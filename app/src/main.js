import {createApp} from 'vue'
import firebase from 'firebase'
import "firebase/analytics";
import {Quasar} from 'quasar'
import mitt from 'mitt'
import quasarConfig from './quasar.conf'
import store from './store'
import router from './router'
import App from './App.vue'
import config from './config'
import moment from 'moment'
import 'moment/min/locales'

const locale = window.navigator.userLanguage || window.navigator.language
moment.locale(locale)

firebase.initializeApp(config)
if (location.hostname === 'localhost') {
    firebase.auth().useEmulator('http://localhost:9099')
    firebase.database().useEmulator('localhost', 9000)
    firebase.firestore().useEmulator('localhost', 5003)
    firebase.storage().useEmulator('localhost', 9199)
    firebase.functions().useEmulator('localhost', 5001)
}
firebase.analytics();
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
        await store.dispatch('user/toggleUserMute', {selfMute: true})
    })
    window.ipcRenderer.on('discoveredNipplioDevice', async (event, service) => {
        console.log('discoveredNipplioDevice event', event)
        console.log('discoveredNipplioDevice service', service)
        await store.dispatch('settings/discoveredNipplioDevice', service)
    })
    window.ipcRenderer.on('openShortcutRegistered', async (event, shortcutString) => {
        await store.dispatch('settings/openShortcutTextChanged', {
            text: shortcutString.replaceAll('+', ' + '),
        })
    })
    window.ipcRenderer.on('clearSearchbarText', async () => {
        await store.dispatch('sound/onSearchChange',
            {
                text: '',
            })
    })
} catch (error) {
    // Is Web instance
}
