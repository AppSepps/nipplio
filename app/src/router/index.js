import { createRouter, createWebHistory } from 'vue-router'
import firebase from 'firebase'

import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import SignInDesktop from '../views/SignInDesktop.vue'

const routes = [
    { path: '/', component: Home, meta: { auth: true } },
    { path: '/login', component: Login },
    { path: '/desktop-sign-in', component: SignInDesktop },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeResolve(async (to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.auth)
    const user = await getCurrentUser()
    if (requiresAuth && !user) {
        next('login')
    } else {
        next()
    }
})

const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = firebase.auth().onAuthStateChanged(user => {
            unsubscribe()
            resolve(user)
        }, reject)
    })
}

export default router
