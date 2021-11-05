<template>
  <div>
    <h5>{{ playlist.name }}</h5>
    <q-btn
        class="board-select-btn"
        color="primary"
        @click="$refs.file.click()">
      <span class="text-bold">Add Sound to Playlist</span>
      <input
          type="file"
          ref="file"
          style="display: none"
          accept="audio/*, video/*"
          multiple="multiple"
          @change="onFileUpload"
      />
    </q-btn>
    <div v-for="(sound) in sounds" :key="sound.id">
      <p>{{ sound.name }}</p>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";

export default {
  name: "Playlist",
  props: ['playlist', 'id'],
  mounted() {
  },
  computed: {
    ...mapState({
      sounds(state) {
        return state.library.playlists[this.$props.id].sounds
      }
    }),
  },
  methods: {
    onFileUpload: function (event) {
      this.$store.dispatch('sound/uploadPublicSound', {
        files: event.target.files,
        playlistId: this.$props.id,
        cbSuccess: () => {
          console.log('Files successfully uploaded')
        },
        cbError: (error) => {
          console.log(error)
        },
      })
    },
  },
}
</script>

<style scoped>

</style>