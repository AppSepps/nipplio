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
