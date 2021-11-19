<template>
  <q-tr :props="props">
    <q-td>
      <q-btn
          unelevated
          round
          icon="play_arrow"
          color="primary"
          @click="onSoundPlay(props.row.id)"
      />
    </q-td>
    <q-td key="name" :props="props">
      <q-chip
          dense
          color="grey-9"
          square
          class="q-mr-sm"
          v-if="hasVisibleIndex(props.row)"
      >{{ getReadableIndex(props.row) }}
      </q-chip
      >
      <span>{{ props.row.name }}</span>
    </q-td>
    <q-td>
      <q-chip
          v-for="tag in getTags(props.row.tags)"
          :key="tag"
          size="sm"
          color="secondary"
      >
        {{ tag }}
      </q-chip>
    </q-td>
    <q-td key="createdAt" :props="props">
      {{ getFormattedDate(props.row.createdAt) }}
    </q-td>
    <q-td auto-width>
      <q-btn
          unelevated
          flat
          round
          :icon="props.row.favorite ? 'favorite' : 'favorite_border'"
          color="red"
          @click="onFavoriteToggle(props.row.id)"
      />
      <q-btn unelevated flat round icon="more_horiz" color="white">
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item
                clickable
                v-close-popup
                @click="onInfoClick(sound, user)"
            >
              <q-item-section avatar>
                <q-icon name="info"/>
              </q-item-section>
              <q-item-section>Info</q-item-section>
            </q-item>
            <q-item
                clickable
                v-close-popup
                @click="onEditClick(sound)"
            >
              <q-item-section avatar>
                <q-icon name="edit"/>
              </q-item-section>
              <q-item-section>Edit</q-item-section>
            </q-item>
            <q-item clickable>
              <q-item-section avatar>
                <q-icon name="library_music"/>
              </q-item-section>
              <q-item-section>Add To Library</q-item-section>
              <q-menu
                  auto-close
                  transition-show="jump-down"
                  transition-hide="jump-up"
              >
                <q-list style="min-width: 100px">
                  <q-item clickable v-for="playlist in myPlaylists" :key="playlist.id"
                          @click="onAddToPlaylistClicked(sound, playlist.id)">
                    <q-item-section>{{ playlist.name }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>
            <q-item
                clickable
                v-close-popup
                @click="onRemoveClick(sound.id)"
            >
              <q-item-section avatar>
                <q-icon name="delete" color="red"/>
              </q-item-section>
              <q-item-section class="text-red"
              >Delete
              </q-item-section
              >
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-td>
  </q-tr>
</template>

<script>
import moment from 'moment'
import {mapGetters} from "vuex";

export default {
  name: 'Sound',
  props: ['sound', 'user', 'props'],
  created() {
    this.moment = moment
  },
  components: {},
  computed: {
    ...mapGetters('library', ['myPlaylists']),
  },
  methods: {
    hasVisibleIndex: function (sound) {
      return sound.index < 9
    },
    getReadableIndex: function (sound) {
      return sound.index + 1
    },
    getTags: function (tag) {
      return tag ? tag.split(',') : []
    },
    getFormattedIndex: function (index) {
      return index <= 9 ? index : '–'
    },
    getFormattedDate: function (timestamp) {
      const createdAtMoment = moment(timestamp)
      if (moment().diff(createdAtMoment, 'd') > 30) {
        return createdAtMoment.format('MMM D, YYYY')
      } else {
        return createdAtMoment.fromNow()
      }
    },
    onSoundPlay: async function (id) {
      await this.$store.dispatch('player/playRemoteSound', {id})
    },
    onFavoriteToggle: async function (id) {
      await this.$store.dispatch('sound/toggleFavoriteSound', {id})
    },
    onEditClick: async function (sound) {
      this.$emit('openEditDialog')
      this.bus.emit('onSoundEditClick', sound)
    },
    onInfoClick: async function (sound, user) {
      this.$emit('openInfoDialog')
      this.bus.emit('onSoundInfoClick', {sound, user})
    },
    onRemoveClick: async function (id) {
      this.$emit('openRemoveDialog')
      this.bus.emit('onSoundRemoveClick', id)
    },
    onAddToPlaylistClicked: async function (sound, playlistId) {
      await this.$store.dispatch('library/addBoardSoundToLibrary', {sound, playlistId})
    }
  },
}
</script>

<style></style>
