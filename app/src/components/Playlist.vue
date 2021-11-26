<template>
  <q-item class="col">
    <q-card class="col">
      <q-card-section horizontal>
        <q-img
            class="col-3"
            src="assets/playlist_placeholder.png"
        >
          <div class="absolute-bottom text-subtitle2 text-center">
            {{ playlist.name }}
            <q-item-label caption>by {{ playlist.ownerName }}</q-item-label>
          </div>
        </q-img>

        <q-card-section class="col">
          <q-item-label>
            {{ playlist.description }}
          </q-item-label>
          <div>
          </div>
          <q-list>
            <q-item v-if="sounds.length == 0">
              Noch keine Sounds verfügbar
            </q-item>
            <q-scroll-area style="height: 200px">
              <q-item clickable v-for="(sound) in sounds" :key="sound.id">
                <q-item-section avatar>
                  <q-btn flat round color="primary" icon="play_arrow" @click="playLocalSound(sound)">
                  </q-btn>
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ sound.name }}</q-item-label>
                </q-item-section>
                <q-item-section avatar>
                  <q-btn flat round color="primary" icon="add_to_photos">
                    <q-menu
                        auto-close
                        transition-show="jump-down"
                        transition-hide="jump-up"
                    >
                      <q-list style="min-width: 100px">
                        <q-item-label header>Boards</q-item-label>
                        <q-item clickable v-for="board in boards" :key="board.id"
                                @click="addLibrarySoundToBoard(sound, board.id)">
                          <q-item-section>{{ board.name }}</q-item-section>
                        </q-item>
                        <q-separator/>
                        <q-item-label header>My Playlists</q-item-label>
                        <q-item clickable v-for="pList in myPlaylists" :key="pList.id"
                                @click="addLibrarySoundToLibrary(sound, pList.id)">
                          <q-item-section v-if="pList.id !== id">{{ pList.name }}
                          </q-item-section>
                          <q-item-section disabled v-else>{{ pList.name }}
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-item-section>
                <q-item-section avatar>
                  <q-btn flat round color="secondary" icon="delete" @click="deleteSoundFromPlaylist(sound)"></q-btn>
                </q-item-section>
              </q-item>
            </q-scroll-area>
          </q-list>
        </q-card-section>
        <q-separator v-if="isOwner" vertical/>
        <q-card-actions v-if="isOwner" vertical class="justify-around">
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
          <q-btn flat round color="secondary" icon="edit" @click="onEditClick"/>
          <q-btn flat round color="secondary" icon="delete" @click="onDeleteClicked"/>
        </q-card-actions>
      </q-card-section>
    </q-card>
  </q-item>
</template>

<script>
import {mapGetters, mapState} from "vuex";
import firebase from "firebase";

export default {
  name: "Playlist",
  props: ['playlist', 'id'],
  mounted() {
  },
  computed: {
    isOwner: function () {
      return (
          this.$props.playlist.owner ===
          firebase.auth().currentUser.uid
      )
    },
    ...mapGetters('library', ['myPlaylists']),
    ...mapState({
      boards(state) {
        return state.board.boards
      },
      sounds(state) {
        return state.library.playlists[this.$props.id].sounds
      }
    }),
  },
  methods: {
    onEditClick: async function () {
      this.$emit('openEditPlaylistDialog')
      this.bus.emit('openEditPlaylistDialog', {id: this.$props.id, playlist: this.$props.playlist})
    },
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
    },
    addLibrarySoundToBoard: async function (sound, boardId) {
      this.$store.dispatch('library/addLibrarySoundToBoard', {sound, boardId})
    },
    addLibrarySoundToLibrary: async function (sound, playlistId) {
      this.$store.dispatch('library/addLibrarySoundToLibrary', {sound, playlistId})
    },
    deleteSoundFromPlaylist: async function (sound) {
      this.$store.dispatch('library/deleteSoundFromPlaylist', {sound, playlistId: this.$props.id})
    }
  },
}
</script>

<style scoped>

</style>