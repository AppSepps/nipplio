import { createRouter, createWebHashHistory } from 'vue-router'
import { Auth } from '@aws-amplify/auth'

import Home from './pages/Home.vue'
import Login from './pages/Login.vue'

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
            await Auth.currentAuthenticatedUser()
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
