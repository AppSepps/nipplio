<template>
  <q-layout container style="height: 100vh" view="lHh LpR lFf">
    <q-header class="shadow-1">
      <q-toolbar class="bg-dark text-white">
        <q-btn
            class="q-ml-sm"
            dense
            flat
            icon="add"
            round
            @click="addPlaylistClicked()"
        />
        <q-space/>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <div class="row">
        <div class="col">
          <q-table
              grid
              :columns="columns"
              :filter="filter"
              :rows="playlistsArray"
              :rows-per-page-options="[0]"
              class="col"
              hide-bottom
              row-key="id"
              separator="none"
              title="Library"
              virtual-scroll
          >
            <template v-slot:top-right>
              <q-input v-model="filter" borderless debounce="300" dense placeholder="Search">
                <template v-slot:append>
                  <q-icon name="search"/>
                </template>
              </q-input>
            </template>
            <template v-slot:item="props">
              <playlist-cell
                  :id="props.row.name"
                  :playlist="props.row"
                  :props="props"
                  v-on:row-click="onPlaylistSelected"
                  v-on:edit-click="onEditClick(props.row, props.row.id)"
                  v-on:delete-click="onDeleteClicked(props.row.id)"
              />
            </template>
          </q-table>
        </div>
        <SelectedPlaylist class="col"/>
        <edit-playlist-dialog v-model="showEditSoundDialog"/>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import {mapState} from "vuex";
import EditPlaylistDialog from "../components/EditPlaylistDialog";
import {Howl} from 'howler'
import {ref} from "vue";
import SelectedPlaylist from "@/components/SelectedPlaylist";
import PlaylistCell from "@/components/PlaylistCell";
import {useQuasar} from "quasar";

const columns = [
  {
    name: 'name',
    required: true,
    label: 'Name',
    align: 'left',
    field: (row) => row.name,
    sortable: true,
  },
  {
    name: 'ownerName',
    required: true,
    label: 'Created by',
    field: (row) => row.ownerName,
    sortable: true,
  },
  {
    name: 'likes',
    required: true,
    label: 'Likes',
    field: (row) => row.likes,
    sortable: true,
  }
]

export default {
  name: "Library",
  components: {SelectedPlaylist, EditPlaylistDialog, PlaylistCell},
  async mounted() {
    await this.$store.dispatch('library/getPlaylists')
  },
  data() {
    return {
      showEditSoundDialog: false,
      columns,
      filter: ref('')
    }
  },
  computed: {
    ...mapState({
      playlists: (state) => state.library.playlists,
      playedLocalSound: (state) => state.library.playedLocalSound
    }),
    cardContainerClass() {
      return useQuasar().screen.gt.xs
          ? 'grid-masonry grid-masonry--' + (useQuasar().screen.gt.sm ? '3' : '2')
          : null
    },
    playlistsArray() {
      let array = []
      for (const [key, value] of Object.entries(this.playlists)) {
        array.push({...value, id: key})
      }
      return array
    }
  },
  methods: {
    addPlaylistClicked: async function () {
      await this.$store.dispatch('library/addPlaylistClicked')
    },
    onPlaylistSelected: async function (evt, row) {
      console.log('clicked row: ', row)
      await this.$store.dispatch('library/selectedPlaylist', row)
      await this.$store.dispatch('library/getSoundsForSelectedPlaylist', row.id)
    },
    onEditClick: async function (playlist, id) {
      console.log(playlist)
      //this.$emit('openEditPlaylistDialog')
      this.bus.emit('openEditPlaylistDialog', {playlist, id})
      this.showEditSoundDialog = true
    },
    onDeleteClicked: async function (id) {
      await this.$store.dispatch('library/removePlaylistWithId', id)
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

<style scoped lang="sass">
.grid-masonry
  flex-direction: column
  height: 700px
</style>