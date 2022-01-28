<template>
  <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
    <q-card @click="onPlaylistSelected(this, props.row)">
        <q-img :ratio="1/1" :src="imageURL" palceholder-src="data:image/svg;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjQzMHB4IiBoZWlnaHQ9IjQzMHB4IiB2aWV3Qm94PSIwIDAgNDMwIDQzMCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpza2V0Y2g9Imh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9ucyI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDMuMi4yICg5OTgzKSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5yZWNvcmQgZHVtbXk8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZGVmcz48L2RlZnM+CiAgICA8ZyBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBza2V0Y2g6dHlwZT0iTVNQYWdlIj4KICAgICAgICA8ZyBpZD0iRGVza3RvcC1IRC0tLW5ldy1pdGVtLXZpZXctMiIgc2tldGNoOnR5cGU9Ik1TQXJ0Ym9hcmRHcm91cCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTE1MC4wMDAwMDAsIC04NzguMDAwMDAwKSI+CiAgICAgICAgICAgIDxnIGlkPSJSZWNvcmRzIiBza2V0Y2g6dHlwZT0iTVNMYXllckdyb3VwIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMzAuMDAwMDAwLCA1NDUuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8ZyBpZD0iSXRlbXMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMDAwMDAwLCA5MS4wMDAwMDApIiBza2V0Y2g6dHlwZT0iTVNTaGFwZUdyb3VwIj4KICAgICAgICAgICAgICAgICAgICA8ZyBpZD0iSXRlbS0xIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLjAwMDAwMCwgMTU2LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgICAgICAgICA8ZyBpZD0iR3JvdXAtKy1PdmFsLTI5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMC4wMDAwMDAsIDg2LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPGcgaWQ9InJlY29yZC1kdW1teSI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHJlY3QgaWQ9IlJlY3RhbmdsZS0xNDkiIGZpbGw9IiNGMUYxRjEiIHg9IjAiIHk9IjAiIHdpZHRoPSI0MzAiIGhlaWdodD0iNDMwIj48L3JlY3Q+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTIxNS41LDQwMSBDMzE3Ljk0ODgyMSw0MDEgNDAxLDMxNy45NDg4MjEgNDAxLDIxNS41IEM0MDEsMTEzLjA1MTE3OSAzMTcuOTQ4ODIxLDMwIDIxNS41LDMwIEMxMTMuMDUxMTc5LDMwIDMwLDExMy4wNTExNzkgMzAsMjE1LjUgQzMwLDMxNy45NDg4MjEgMTEzLjA1MTE3OSw0MDEgMjE1LjUsNDAxIFogTTIxNiwyNzQgQzI0OC4wMzI1MTUsMjc0IDI3NCwyNDguMDMyNTE1IDI3NCwyMTYgQzI3NCwxODMuOTY3NDg1IDI0OC4wMzI1MTUsMTU4IDIxNiwxNTggQzE4My45Njc0ODUsMTU4IDE1OCwxODMuOTY3NDg1IDE1OCwyMTYgQzE1OCwyNDguMDMyNTE1IDE4My45Njc0ODUsMjc0IDIxNiwyNzQgWiBNMjE1LjUsMjI3IEMyMjEuODUxMjc1LDIyNyAyMjcsMjIxLjg1MTI3NSAyMjcsMjE1LjUgQzIyNywyMDkuMTQ4NzI1IDIyMS44NTEyNzUsMjA0IDIxNS41LDIwNCBDMjA5LjE0ODcyNSwyMDQgMjA0LDIwOS4xNDg3MjUgMjA0LDIxNS41IEMyMDQsMjIxLjg1MTI3NSAyMDkuMTQ4NzI1LDIyNyAyMTUuNSwyMjcgWiBNMjE1LjUsMjIxLjUgQzIxOC44MTM3MDgsMjIxLjUgMjIxLjUsMjE4LjgxMzcwOCAyMjEuNSwyMTUuNSBDMjIxLjUsMjEyLjE4NjI5MiAyMTguODEzNzA4LDIwOS41IDIxNS41LDIwOS41IEMyMTIuMTg2MjkyLDIwOS41IDIwOS41LDIxMi4xODYyOTIgMjA5LjUsMjE1LjUgQzIwOS41LDIxOC44MTM3MDggMjEyLjE4NjI5MiwyMjEuNSAyMTUuNSwyMjEuNSBaIiBpZD0iT3ZhbC0yOSIgZmlsbD0iI0UyRTJFMiI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=">
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