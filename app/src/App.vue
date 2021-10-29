<template>
    <q-layout class="bg-dark">
        <q-page-container>
          <board-select
              v-on:openAddBoardDialog="showAddBoardDialog = true"
              v-on:openCustomizeDialog="showCustomizeDialog = true"
              v-on:openSettingsDialog="showSettingsModal = true"
          />
            <router-view></router-view>
        </q-page-container>
    </q-layout>
</template>

<script>
import firebase from 'firebase'
import BoardSelect from './components/BoardSelect.vue'

export default {
    name: 'App',
    components: {BoardSelect},
    data() {
        return {
            unsubscribeAuth: undefined,
        }
    },
    created() {
        this.$store.dispatch('theme/setTheme', { id: null })
        this.$q.dark.set(true)
        this.unsubscribeAuth = firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                firebase
                    .auth()
                    .currentUser.getIdToken()
                    .then((idToken) => {
                        console.log(idToken)
                    })
                // This needs to be commented, because otherwise the invite link does not work
                //this.$router.push('/')
            } else {
                //this.$router.push('/login')
            }
        })
    },
    beforeUnmount() {
        this.unsubscribeAuth()
    },
}
</script>
