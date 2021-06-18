import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import './styles/element-variables.scss'
import router from './router'
import {
    applyPolyfills,
    defineCustomElements,
} from '@aws-amplify/ui-components/loader'

import App from './App.vue'

import Amplify from 'aws-amplify'
import awsconfig from './aws-exports'
Amplify.configure(awsconfig)

applyPolyfills().then(() => {
    defineCustomElements(window)
})

const app = createApp(App)
app.config.isCustomElement = (tag) => tag.startsWith('amplify-')
app.use(router)
app.use(ElementPlus)
app.mount('#app')
