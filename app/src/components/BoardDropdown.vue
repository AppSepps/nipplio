<template>
    <q-btn-dropdown color="primary" label="Boards" no-caps>
        <q-list>
            <q-item
                v-for="board in boards"
                :key="board.id"
                clickable
                v-close-popup
                @click="onBoardClick(board.id)"
            >
                <q-item-section>
                    <q-item-label>{{ board.name }}</q-item-label>
                </q-item-section>
                <q-item-section avatar>
                    <q-icon
                        v-if="activeBoard && activeBoard.id === board.id"
                        color="primary"
                        name="check"
                    />
                    <q-icon v-else color="white" name="web" />
                </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="openAddBoardDialog">
                <q-item-section>
                    <q-item-label>Add Board</q-item-label>
                    <q-item-label caption
                        >Create a new board or join an existing
                        one</q-item-label
                    >
                </q-item-section>
                <q-item-section avatar>
                    <q-icon color="white" name="add" />
                </q-item-section>
            </q-item>
        </q-list>
    </q-btn-dropdown>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'BoardDropdown',
    computed: {
        ...mapState({
            activeBoard: (state) => state.board.activeBoard,
            boards: (state) => state.board.boards,
        }),
    },
    methods: {
        onBoardClick: async function (id) {
            this.$store.dispatch('board/selectBoard', { id })
        },
        openAddBoardDialog: function () {
            this.$emit('openDialog')
        },
    },
}
</script>

<style></style>
