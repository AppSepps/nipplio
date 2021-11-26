<template>
  <q-layout view="lHh LpR lFf" container style="height: 100vh">
    <q-header class="shadow-1">
      <q-toolbar class="bg-dark text-white">
        <q-btn
            flat
            @click="addPlaylistClicked()"
            round
            dense
            class="q-ml-sm"
            icon="add"
        />
        <q-space/>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <div class="row">
        <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6" v-for="(playlist, id) in playlists" :key="id">
          <playlist
              :playlist="playlist"
              :id="id"
              v-on:openEditPlaylistDialog="showEditSoundDialog = true"
          ></playlist>
        </div>
      </div>
      <edit-playlist-dialog v-model="showEditSoundDialog"/>
    </q-page-container>
  </q-layout>
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