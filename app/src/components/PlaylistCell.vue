<template>
  <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
    <q-card @click="onPlaylistSelected(this, props.row)">
        <q-img :ratio="1/1" :src="imageURL">
          <div class="absolute-bottom text-subtitle2 text-center">
            {{props.row.name}}
              <q-btn color="white" class="" flat icon="more_horiz" round unelevated @click.stop>
                <q-menu>
                  <q-list style="min-width: 100px">
                    <q-item
                        v-close-popup
                        clickable
                        @click="onEditClicked"
                    >
                      <q-item-section avatar>
                        <q-icon name="edit"/>
                      </q-item-section>
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-item
                        v-close-popup
                        clickable
                        @click="onDeleteClicked"
                    >
                      <q-item-section avatar>
                        <q-icon color="red" name="delete"/>
                      </q-item-section>
                      <q-item-section class="text-red"
                      >Delete
                      </q-item-section
                      >
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
          </div>
        </q-img>
    </q-card>
  </div>
</template>
<script>

export default {
  name: "PlaylistCell",
  props: ['playlist', 'id', 'props'],
  mounted() {
  },
  computed: {
    imageURL: function() {
      if (this.playlist !== undefined && this.playlist.thumbnailURL !== undefined) {
        return this.playlist.thumbnailURL
      } else {
        return "https://recordsale.de/assets/record_placeholder-f6f9c8ec7c95af894337c529945c4f77cfbe802ee073e672cd264c1186ad0238.svg"
      }
    }
  },
  methods: {
    onPlaylistSelected: async function (evt, row) {
      console.log('clicked row within: ', row)
      this.$emit('row-click', evt, row)
    },
    onDeleteClicked: async function () {
      this.$emit('delete-click', this.id)
    },
    onEditClicked: async function () {
      console.log("emit edit")
      this.$emit('edit-click', this.playlist, this.id)
    }
  },
}
</script>

<style scoped>

</style>