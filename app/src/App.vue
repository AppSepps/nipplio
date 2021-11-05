<template>
  <q-layout class="bg-dark">
    <q-page-container>
      <board-select
          v-on:openAddBoardDialog="showAddBoardDialog = true"
          v-on:openCustomizeDialog="showCustomizeDialog = true"
          v-on:openSettingsDialog="showSettingsModal = true"
      />
      <router-view></router-view>
      <add-board-dialog
          v-model="showAddBoardDialog"
          v-on:closeDialog="showAddBoardDialog = false"
      />
      <customize-dialog v-model="showCustomizeDialog"/>
      <settings
          v-model="showSettingsModal"
          v-on:openSlotMappingDialog="showSlotMappingDialog = true"
      />
    </q-page-container>
  </q-layout>
</template>

<script>
import firebase from 'firebase'
import BoardSelect from './components/BoardSelect.vue'
import AddBoardDialog from "./components/AddBoardDialog";
import CustomizeDialog from "./components/CustomizeDialog";
import Settings from "./views/Settings";


export default {
  name: 'App',
  components: {BoardSelect, AddBoardDialog, CustomizeDialog, Settings},
  data() {
    return {
      unsubscribeAuth: undefined,
      showSettingsModal: false,
      showAddBoardDialog: false,
      showCustomizeDialog: false,
    }
  },
  async created() {
    this.$store.dispatch('theme/setTheme', {id: null})
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
    await this.$store.dispatch('board/getBoards')
  },
  beforeUnmount() {
    this.unsubscribeAuth()
  },
}
</script>
