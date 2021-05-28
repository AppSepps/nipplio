import Vue from 'vue'
import Chakra, { CThemeProvider, CReset } from '@chakra-ui/vue'

import App from './App'
import router from './router'
import store from './store'

Vue.config.productionTip = false

Vue.use(Chakra, {
    extendTheme: {
        useSystemColorMode: true,
    },
})

/* eslint-disable no-new */
new Vue({
    components: { App },
    router,
    store,
    template: '<App/>',
    render: (h) => h(CThemeProvider, [h(CReset), h(App)]),
}).$mount('#app')
