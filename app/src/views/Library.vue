<template>
  <div>
    <p>Public Dashboard</p>
    <q-btn
        class="board-select-btn"
        color="primary"
        @click="addPlaylistClicked()">
      <span class="text-bold">Create new Playlist</span>
    </q-btn>
    <div v-for="(playlist, id) in playlists" :key="id">
      <playlist :playlist="playlist" :id="id"></playlist>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";
import Playlist from "../components/Playlist";

export default {
  name: "PublicDashboard",
  components: {Playlist},
  async mounted() {
    await this.$store.dispatch('library/getPlaylists')
  },
  computed: {
    ...mapState({
      playlists: (state) => state.library.playlists,
    })
  },
  methods: {
    addPlaylistClicked: async function () {
      await this.$store.dispatch('library/addPlaylistClicked')
    }
  }
}
</script>

<style scoped>

</style>