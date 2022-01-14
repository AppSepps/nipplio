<template>
  <q-tr :props="props" @click="onPlaylistSelected(this, props.row)">
    <q-td key="name" :props="props">
      <span>{{ props.row.name }}</span>
    </q-td>
    <q-td key="ownerName" :props="props">
      {{ props.row.ownerName }}
    </q-td>
    <q-td key="likes" :props="props">
      {{ props.row.likes }}
    </q-td>
    <q-td auto-width>
      <q-btn color="white" flat icon="more_horiz" round unelevated @click.stop>
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
                disabled
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
    </q-td>
  </q-tr>
</template>
<script>

export default {
  name: "PlaylistCell",
  props: ['playlist', 'id', 'props'],
  mounted() {
  },
  computed: {},
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