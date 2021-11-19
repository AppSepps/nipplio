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
      lastActiveBoard: (state) => state.board.lastActiveBoard,
      boards: (state) => state.board.boards,
    }),
  },
  watch: {
    boards(boards) {
      if (boards.filter((board) => board.id === this.lastActiveBoard.id).length > 0) {
        this.$router.push(`/board/${this.lastActiveBoard !== undefined ? this.lastActiveBoard.id : this.boards.first.id}`)
      }
    }
  },
  async mounted() {
  },
}
</script>

<style></style>
