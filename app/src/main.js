import { createApp } from 'vue'
import store from './store'
import router from './router'
import {
    applyPolyfills,
    defineCustomElements,
} from '@aws-amplify/ui-components/loader'
import App from './App.vue'
import Amplify from 'aws-amplify'
import { AWSIoTProvider } from '@aws-amplify/pubsub'
import awsconfig from './aws-exports'
import { Quasar } from 'quasar'
import quasarUserOptions from './quasar-user-options'

Amplify.configure(awsconfig)

Amplify.addPluggable(
    new AWSIoTProvider({
        aws_pubsub_region: 'eu-west-1',
        aws_pubsub_endpoint:
            'wss://a3786zo10jgi9e-ats.iot.eu-west-1.amazonaws.com/mqtt',
    })
)

applyPolyfills().then(() => {
    defineCustomElements(window)
})

const app = createApp(App)
app.config.isCustomElement = (tag) => tag.startsWith('amplify-')
app.use(store)
app.use(Quasar, quasarUserOptions)
app.use(router)
app.mount('#app')
