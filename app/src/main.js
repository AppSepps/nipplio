import { createApp } from 'vue'
import firebase from 'firebase'
import { Quasar } from 'quasar'
import quasarUserOptions from './quasar-user-options'
import store from './store'
import router from './router'
import App from './App.vue'
import config from './config'

firebase.initializeApp(config)

let app
firebase.auth().onAuthStateChanged(() => {
    if (!app) {
        app = createApp(App)
        app.use(store)
        app.use(Quasar, quasarUserOptions)
        app.use(router)
        app.mount('#app')
    }
})
