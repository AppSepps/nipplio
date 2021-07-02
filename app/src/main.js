import { createApp } from 'vue'
import store from './store'
import router from './router'
import App from './App.vue'
import { Quasar } from 'quasar'
import quasarUserOptions from './quasar-user-options'

const app = createApp(App)
app.use(store)
app.use(Quasar, quasarUserOptions)
app.use(router)
app.mount('#app')
