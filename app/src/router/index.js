import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Home'
import Board from '@/views/Board'
import Welcome from '@/views/Welcome'
import Library from '@/views/Library'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const routes = [
    { path: '/', component: Home, meta: { auth: true } },
    { path: '/board/:boardId', component: Board, meta: { auth: true } },
    { name: 'library', path: '/library', component: Library, meta: { auth: true } },
    { path: '/welcome', component: Welcome },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeResolve(async (to, from, next) => {
    const requiresAuth = to.matched.some((record) => record.meta.auth)
    const user = await getCurrentUser()
    if (requiresAuth && !user) {
        next('welcome')
    } else {
        next()
    }
})

const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
            unsubscribe()
            resolve(user)
        }, reject)
    })
}

export default router
