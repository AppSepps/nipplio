<template>
    <router-view></router-view>
</template>

<script>
import { onAuthUIStateChange } from '@aws-amplify/ui-components'

export default {
    name: 'App',
    components: {},
    data() {
        return {
            unsubscribeAuth: undefined,
        }
    },
    created() {
        this.unsubscribeAuth = onAuthUIStateChange((authState, user) => {
            if (user) {
                this.$router.push('/')
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

<style>
#app {
    font-family: Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    background-color: #2c3e50;
    height: 100vh;
}
body {
    margin: 0;
    height: 100vh;
}
</style>
