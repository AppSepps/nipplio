<template>
  <q-btn
      v-if="activeBoard"
      unelevated
      icon-right="expand_more"
      no-caps
      color="grey-9"
      :label="activeBoard.name"
  >
    <q-menu>
      <q-list style="min-width: 100px">
        <q-item clickable v-close-popup @click="$refs.file.click()">
          <q-item-section avatar>
            <q-icon name="publish" color="primary"/>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-primary"
            >Upload Sound
            </q-item-label
            >
          </q-item-section>
          <input
              type="file"
              ref="file"
              style="display: none"
              accept="audio/*, video/*"
              multiple="multiple"
              @change="onFileUpload"
          />
        </q-item>
        <q-item
            v-if="owner"
            clickable
            v-close-popup
            @click="onInviteClicked"
        >
          <q-item-section avatar>
            <q-icon name="person_add"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Invite Users</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
            v-if="owner"
            clickable
            v-close-popup
            @click="onManageBoardClicked"
        >
          <q-item-section avatar>
            <q-icon name="edit_note"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Manage Board</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="onLeaveClicked">
          <q-item-section avatar>
            <q-icon name="logout" color="red"/>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-red"
            >Leave Board
            </q-item-label
            >
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script>
import {mapState} from 'vuex'

export default {
  name: 'BoardTitleDropdown',
  components: {},
  computed: {
    ...mapState({
      activeBoard: (state) => state.board.activeBoard,
      user: (state) => state.user.user,
      owner: (state) =>
          state.board.activeBoard &&
          state.user.user &&
          state.board.activeBoard.owner === state.user.user.uid,
    }),
  },
  methods: {
    onFileUpload: function (event) {
      this.$store.dispatch('sound/uploadSoundFile', {
        files: event.target.files,
        cbSuccess: () => {
          console.log('Files successfully uploaded')
        },
        cbError: (error) => {
          console.log(error)
        },
      })
    },
    onInviteClicked: function () {
      this.$store.dispatch('board/inviteUser', {
        cb: (url) => {
          this.$emit('openInviteDialog')
          this.bus.emit('onInviteUrlGenerate', url)
        },
      })
    },
    onManageBoardClicked: function () {
      this.$emit('openManageBoardDialog')
    },
    onLeaveClicked: function () {
      this.$emit('openLeaveBoardDialog')
    },
  },
}
</script>

<style></style>
