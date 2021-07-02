<template>
    <q-btn-dropdown color="primary" label="Boards">
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
            <q-item clickable v-close-popup @click="onJoinNewBoardClick">
                <q-item-section>
                    <q-item-label>Create Board</q-item-label>
                    <q-item-label caption
                        >Click here to create a new board</q-item-label
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
export default {
    name: 'BoardDropdown',
    props: ['boards', 'activeBoard'],
    components: {},
    methods: {
        onBoardClick: async function (id) {
            await this.$store.dispatch('app/selectBoard', { id })
            await this.$store.dispatch('app/getBoardData')
        },
        onJoinNewBoardClick: function () {
            console.log('Trying to join a new board')
        },
    },
}
</script>

<style></style>
