import Vue from 'vue'
import Chakra, { CThemeProvider, CReset } from '@chakra-ui/vue'
import Amplify, { Auth } from 'aws-amplify'
import awsconfig from './aws-exports'

import App from './App'
import router from './router'
import store from './store'

Vue.config.productionTip = false

Vue.use(Chakra, {
    extendTheme: {
        useSystemColorMode: true,
    },
})

Amplify.configure(awsconfig)

/* eslint-disable no-new */
new Vue({
    components: { App },
    router,
    store,
    template: '<App/>',
    render: (h) => h(CThemeProvider, [h(CReset), h(App)]),
}).$mount('#app')
