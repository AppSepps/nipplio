<template>
  <q-item>
    <q-item-section>
      <q-item-label>Shortcut to open</q-item-label>
    </q-item-section>
    <q-item-section avatar>
      <q-input disable readonly filled :dense="true" v-model="openShortcutText"/>
    </q-item-section>
    <q-item-section avatar>
      <q-btn :color="openShortcutRecording ? 'secondary' : 'primary'" @click="toggleOpenShortcutRecording"
             no-caps
             :label="openShortcutRecording ? 'Stop recording' : 'Record shortcut'"/>
    </q-item-section>
  </q-item>
</template>

<script>
import {mapActions, mapGetters} from "vuex";

export default {
  name: 'OpenShortcutItem',
  methods: {
    ...mapActions('settings', ['toggleOpenShortcutRecording']),
    focus: function () {
      this.$refs.input.focus()
    },
  },
  computed: {
    openShortcutText: {
      get() {
        return this.$store.state.settings.openShortcutText
      },
      set(value) {
        console.log(value)
        return this.$store.dispatch('settings/openShortcutTextChanged', {
          text: "test",
        }, {root: true})
      },
    },
    ...mapGetters('settings', ['openShortcutRecording']),
  },
}
</script>

<style></style>
