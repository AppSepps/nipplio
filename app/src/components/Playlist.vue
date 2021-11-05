<template>
  <q-item>
    <q-item-section top avatar>
      <q-item-label>{{ playlist.name }}</q-item-label>
      <q-btn
          round
          class="board-select-btn"
          color="primary"
          @click="$refs.file.click()">
        <span class="text-bold">+</span>
        <input
            type="file"
            ref="file"
            style="display: none"
            accept="audio/*, video/*"
            multiple="multiple"
            @change="onFileUpload"
        />
      </q-btn>
    </q-item-section>
    <q-item-section top>
      <div v-for="(sound) in sounds" :key="sound.id">
        <q-item-label>{{ sound.name }}</q-item-label>
        <q-btn
            round
            class="board-select-btn"
            color="primary"
            @click="playLocalSound(sound)">
          <span class="text-bold">Play</span>
        </q-btn>
      </div>
    </q-item-section>
  </q-item>

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
    playLocalSound: function () {
      this.$store.dispatch('')
    }
  },
}
</script>

<style scoped>

</style>