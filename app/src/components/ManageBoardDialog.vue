<template>
    <q-dialog>
        <q-card style="width: 450px; max-width: 80vw">
            <q-card-section class="row items-center">
                <div class="text-h6">Manage Board</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>
            <q-card-section class="q-p-none">
                <q-form @submit="onBoardNameChange">
                    <q-input
                        filled
                        dense
                        v-model="boardName"
                        placeholder="BraveBoardBuddies"
                        label="Board Name"
                        :rules="[
                            (val) =>
                                (val && val.length > 0) ||
                                'Please type something',
                        ]"
                    >
                        <template v-slot:after>
                            <q-btn
                                color="primary"
                                icon="check"
                                :disabled="boardName.trim().length == 0"
                                @click="onBoardNameChange"
                            />
                        </template>
                    </q-input>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'ManageBoardDialog',
    data() {
        return {
            boardName: '',
        }
    },
    computed: {
        ...mapState({
            activeBoard: (state) => state.board.activeBoard,
            boardUsers: (state) => state.user.boardUsers,
            user: (state) => state.user.user,
        }),
    },
    mounted() {
        this.boardName = this.activeBoard.name
    },
    components: {},
    methods: {
        onBoardNameChange: function () {
            this.$store.dispatch('board/changeBoardName', {
                boardName: this.boardName,
            })
        },
    },
}
</script>

<style></style>
