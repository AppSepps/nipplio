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
      <playlist
          :playlist="playlist"
          :id="id"
          v-on:openEditPlaylistDialog="showEditSoundDialog = true"
      ></playlist>
    </div>
    <edit-playlist-dialog v-model="showEditSoundDialog"/>
  </div>
</template>

<script>
import {mapState} from "vuex";
import Playlist from "../components/Playlist";
import {Howl} from 'howler'
import EditPlaylistDialog from "../components/EditPlaylistDialog";

export default {
  name: "Library",
  components: {EditPlaylistDialog, Playlist},
  async mounted() {
    await this.$store.dispatch('library/getPlaylists')
  },
  data() {
    return {
      showEditSoundDialog: false
    }
  },
  computed: {
    ...mapState({
      playlists: (state) => state.library.playlists,
      playedLocalSound: (state) => state.library.playedLocalSound
    })
  },
  methods: {
    addPlaylistClicked: async function () {
      await this.$store.dispatch('library/addPlaylistClicked')
    }
  },
  watch: {
    playedLocalSound(sound) {
      if (this.audio !== undefined) {
        this.audio.stop()
      }
      this.audio = new Howl({
        src: [sound.soundUrl],
        format: ['mp3']
      })
      this.audio.play()
    }
  }
}
</script>

<style scoped>

</style>