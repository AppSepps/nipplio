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
import {Howl} from 'howler'

export default {
  name: "Library",
  components: {Playlist},
  async mounted() {
    await this.$store.dispatch('library/getPlaylists')
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