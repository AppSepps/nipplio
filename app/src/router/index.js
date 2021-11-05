import {createRouter, createWebHistory} from 'vue-router'
import firebase from 'firebase'

import Home from '../views/Home.vue'
import Board from '../views/Board.vue'
import Welcome from '../views/Welcome.vue'
import Login from '../views/Login.vue'
import Library from "../views/Library";

const routes = [
    {path: '/', component: Home, meta: {auth: true}},
    {path: '/board/:boardId', component: Board, meta: {auth: true}},
    {path: '/library', component: Library, meta: {auth: true}},
    {path: '/welcome', component: Welcome},
    {path: '/auth', component: Login},
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
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            unsubscribe()
            resolve(user)
        }, reject)
    })
}

export default router
