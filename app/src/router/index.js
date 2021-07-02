import { createRouter, createWebHashHistory } from 'vue-router'

import Home from '../views/Home.vue'
import Login from '../views/Login.vue'

const routes = [
    { path: '/', component: Home, meta: { auth: true } },
    { path: '/login', component: Login },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

router.beforeResolve(async (to, from, next) => {
    if (to.matched.some((record) => record.meta.auth)) {
        try {
            //await Auth.currentAuthenticatedUser()
            next()
        } catch {
            next({
                path: '/login',
            })
        }
    } else {
        next()
    }
})

export default router
