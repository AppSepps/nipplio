import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import {
    applyPolyfills,
    defineCustomElements,
} from '@aws-amplify/ui-components/loader'

import App from './App.vue'
import Home from './pages/Home.vue'

import Amplify from 'aws-amplify'
import awsconfig from './aws-exports'
Amplify.configure(awsconfig)

applyPolyfills().then(() => {
    defineCustomElements(window)
})

const routes = [{ path: '/', component: Home }]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

const app = createApp(App)
app.config.isCustomElement = (tag) => tag.startsWith('amplify-')
app.use(router)
app.mount('#app')
