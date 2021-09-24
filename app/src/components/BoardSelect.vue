<template>
    <q-drawer side="left" show-if-above :width="65" class="bg-grey-10">
        <q-scroll-area class="fit">
            <div class="q-pa-sm">
                <div
                    class="q-my-sm"
                    v-for="board in sortedBoards"
                    :key="board.id"
                >
                    <q-btn
                        round
                        class="board-select-btn"
                        :color="
                            activeBoard && activeBoard.id === board.id
                                ? 'primary'
                                : 'grey-9'
                        "
                        @click="
                            onBoardClick(
                                board.id,
                                activeBoard && activeBoard.id === board.id
                            )
                        "
                    >
                        <span
                            :class="
                                activeBoard && activeBoard.id === board.id
                                    ? 'text-bold'
                                    : ''
                            "
                            >{{ board.name[0] }}</span
                        >
                        <q-tooltip
                            class="bg-grey-9"
                            anchor="center right"
                            self="center left"
                            :delay="500"
                            >{{ board.name }}</q-tooltip
                        >
                    </q-btn>
                </div>
                <q-separator />
                <q-btn
                    round
                    class="board-select-btn q-my-sm"
                    color="grey-9"
                    text-color="primary"
                    @click="openAddBoardDialog"
                    icon="add"
                />
                <q-btn
                    round
                    class="board-select-btn"
                    color="grey-9"
                    text-color="primary"
                    @click="openCustomizeDialog"
                    icon="palette"
                />
            </div>
        </q-scroll-area>
    </q-drawer>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
    name: 'BoardSelect',
    components: {},
    computed: {
        ...mapGetters('board', ['sortedBoards']),
        ...mapState({
            activeBoard: (state) => state.board.activeBoard,
        }),
    },
    methods: {
        onBoardClick: async function (id, active) {
            if (!active) {
                this.$store.dispatch('board/selectBoard', { id })
            }
        },
        openAddBoardDialog: function () {
            this.$emit('openAddBoardDialog')
        },
        openCustomizeDialog: function () {
            this.$emit('openCustomizeDialog')
        },
    },
}
</script>

<style></style>
