<template>
  <div>
    Home
  </div>
</template>

<script>

import {mapState} from "vuex";

export default {
  name: 'Home',
  components: {},
  data() {
    return {}
  },
  methods: {},
  computed: {
    ...mapState({
      activeBoard: (state) => state.board.activeBoard,
    }),
  },
  async mounted() {
    this.$router.push(`/board/${this.activeBoard.id}`)
  },
}
</script>

<style></style>
