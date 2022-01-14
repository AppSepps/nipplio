<template>
  <div>
    <q-table
        v-if="selectedPlaylist.sounds !== undefined && selectedPlaylist.sounds.length > 0"
        :columns="columns"
        :filter="filter"
        :rows="selectedPlaylist.sounds"
        :rows-per-page-options="[0]"
        :title="selectedPlaylist.name"
        class="col"
        flat
        hide-bottom
        row-key="id"
        separator="none"
        virtual-scroll
    >
      <template v-slot:top-right>
        <q-input v-model="filter" borderless debounce="0" dense placeholder="Search">
          <template v-slot:append>
            <q-icon name="search"/>
          </template>
        </q-input>
      </template>
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width/>
          <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
          >
            {{ col.label }}
          </q-th>
          <q-th auto-width/>
        </q-tr>
      </template>
      <template v-slot:body="props">
        <playlist-sound-cell
            :boards="boards"
            :my-playlists="myPlaylists"
            :props="props"
            :sound="props.row"
            :user="props.row.name"
            v-on:addLibrarySoundToBoardClicked="addLibrarySoundToBoard"
            v-on:addLibrarySoundToLibraryClicked="addLibrarySoundToLibrary"
            v-on:row-click="onSoundPlayedClicked"
        />
      </template>
    </q-table>
    <div v-else>
      Currently no Playlist selected
    </div>
  </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";
import {ref} from "vue";
import PlaylistSoundCell from "@/components/PlaylistSoundCell";

const columns = [
  {
    name: 'name',
    required: true,
    label: 'Name',
    align: 'left',
    field: (row) => row.name,
    sortable: true,
  }
]

export default {
  name: "SelectedPlaylist",
  components: {PlaylistSoundCell},
  data() {
    return {
      columns,
      filter: ref(''),
    }
  },
  computed: {
    ...mapGetters('library', ['selectedPlaylist', 'myPlaylists']),
    ...mapState({
      boards(state) {
        return state.board.boards
      }
    }),
  },
  methods: {
    onSoundPlayedClicked: async function (sound) {
      console.log(sound)
      await this.$store.dispatch('library/playLocalSound', sound)
    },
    addLibrarySoundToBoard: async function (sound, boardId) {
      this.$store.dispatch('library/addLibrarySoundToBoard', {sound, boardId})
    },
    addLibrarySoundToLibrary: async function (sound, playlistId) {
      this.$store.dispatch('library/addLibrarySoundToLibrary', {sound, playlistId})
    },
  }
}
</script>

<style scoped>

</style>