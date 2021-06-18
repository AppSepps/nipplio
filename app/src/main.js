import { createApp } from 'vue'
import router from './router'
import {
    applyPolyfills,
    defineCustomElements,
} from '@aws-amplify/ui-components/loader'
import App from './App.vue'
import Amplify from 'aws-amplify'
import awsconfig from './aws-exports'
import { Quasar } from 'quasar'
import quasarUserOptions from './quasar-user-options'

Amplify.configure(awsconfig)

applyPolyfills().then(() => {
    defineCustomElements(window)
})

const app = createApp(App)
app.config.isCustomElement = (tag) => tag.startsWith('amplify-')
app.use(Quasar, quasarUserOptions)
app.use(router)
app.mount('#app')
