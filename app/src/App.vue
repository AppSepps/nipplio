<template>
    <q-layout class="bg-dark">
        <q-page-container>
            <router-view></router-view>
        </q-page-container>
    </q-layout>
</template>

<script>
import firebase from 'firebase'

export default {
    name: 'App',
    components: {},
    data() {
        return {
            unsubscribeAuth: undefined,
        }
    },
    created() {
        this.$q.dark.set(true)
        this.unsubscribeAuth = firebase.auth().onAuthStateChanged(user => {
            if (user) {
                // This needs to be commented, because otherwise the invite link does not work
                //this.$router.push('/')
            } else {
                this.$router.push('/login')
            }
        })
    },
    beforeUnmount() {
        this.unsubscribeAuth()
    },
}
</script>
