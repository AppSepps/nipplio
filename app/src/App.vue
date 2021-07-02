<template>
    <q-layout>
        <q-page-container>
            <router-view></router-view>
        </q-page-container>
    </q-layout>
</template>

<script>
export default {
    name: 'App',
    components: {},
    data() {
        return {
            //unsubscribeAuth: undefined,
        }
    },
    created() {
        this.$q.dark.set(true)
        /*this.unsubscribeAuth = onAuthUIStateChange((authState, user) => {
            if (user) {
                this.$router.push('/')
            } else {
                this.$router.push('/login')
            }
        })*/
    },
    beforeUnmount() {
        //this.unsubscribeAuth()
    },
}
</script>
