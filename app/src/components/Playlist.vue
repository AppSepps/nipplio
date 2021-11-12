<template>
  <q-item>
    <q-card class="col-8">
      <q-card-section horizontal>
        <q-img
            class="col-4"
            src="https://cdn.quasar.dev/img/parallax1.jpg"
        >
          <div class="absolute-bottom text-subtitle2 text-center">
            {{ playlist.name }}
          </div>
        </q-img>

        <q-card-section class="col">
          <div>
            {{ playlist.description }}
          </div>
          <q-list>
            <q-item v-if="sounds.length == 0">
              Noch keine Sounds verfügbar
            </q-item>
            <q-item clickable v-for="(sound) in sounds" :key="sound.id">
              <q-item-section avatar>
                <q-btn flat round color="primary" icon="play_arrow" @click="playLocalSound(sound)">
                </q-btn>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ sound.name }}</q-item-label>
                <q-item-label caption>Have a drink.</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-separator vertical/>
        <q-card-actions vertical class="justify-around">
          <q-btn flat round color="primary" icon="add" @click="$refs.file.click()">
            <input
                type="file"
                ref="file"
                style="display: none"
                accept="*"
                multiple="multiple"
                @change="onFileUpload"
            />
          </q-btn>
          <q-btn flat round color="secondary" icon="edit" @click="onEditClicked"/>
          <q-btn flat round color="secondary" icon="delete" @click="onDeleteClicked"/>
        </q-card-actions>
      </q-card-section>
    </q-card>
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
          this.$store.dispatch('library/getPlaylists')
        },
        cbError: (error) => {
          console.log(error)
        },
      })
    },
    playLocalSound: async function (sound) {
      this.$store.dispatch('library/playLocalSound', sound)
    },
    onDeleteClicked: async function () {
      this.$store.dispatch('library/removePlaylistWithId', this.$props.id)
    }
  },
}
</script>

<style scoped>

</style>