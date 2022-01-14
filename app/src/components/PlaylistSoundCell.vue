<template>
  <q-tr :props="props">
    <q-td>
      <q-btn
          color="primary"
          icon="play_arrow"
          round
          unelevated
          @click="onSoundPlay(props.row.id)"
      />
    </q-td>
    <q-td key="name" :props="props">
      <span>{{ props.row.name }}</span>
    </q-td>
    <q-td key="createdAt" :props="props">
      {{ getFormattedDate(props.row.createdAt) }}
    </q-td>
    <q-td>
      <q-btn color="primary" flat icon="add_to_photos" round>
        <q-menu
            auto-close
            transition-hide="jump-up"
            transition-show="jump-down"
        >
          <q-list style="min-width: 100px">
            <q-item-label header>Boards</q-item-label>
            <q-item v-for="board in boards" :key="board.id" clickable
                    @click="addLibrarySoundToBoardClicked(sound, board.id)">
              <q-item-section>{{ board.name }}</q-item-section>
            </q-item>
            <q-separator/>
            <q-item-label header>My Playlists</q-item-label>
            <q-item v-for="pList in myPlaylists" :key="pList.id" clickable
                    @click="addLibrarySoundToLibraryClicked(sound, pList.id)">
              <q-item-section v-if="pList.id !== id">{{ pList.name }}
              </q-item-section>
              <q-item-section v-else disabled>{{ pList.name }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-td>
  </q-tr>
</template>

<script>

export default {
  name: 'PlaylistSoundCell',
  props: ['sound', 'props', 'myPlaylists', 'boards'],
  created() {
  },
  components: {},
  computed: {},
  methods: {
    addLibrarySoundToBoardClicked: function (sound, boardId) {
      this.$emit('addLibrarySoundToBoardClicked', sound, boardId)
    },
    addLibrarySoundToLibraryClicked: function (sound, libraryId) {
      this.$emit('addLibrarySoundToLibraryClicked', sound, libraryId)
    },
    onSoundPlay: async function () {
      this.$emit('row-click', this.sound)
    },
  },
}
</script>

<style></style>
