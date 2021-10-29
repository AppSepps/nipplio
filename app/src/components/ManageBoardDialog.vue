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
                <q-list>
                    <q-item-label header>Manage Users</q-item-label>
                    <q-item v-for="user in boardUsers" :key="user.id">
                        <q-item-section avatar>
                            <q-avatar v-if="user.photoURL">
                                <img :src="user.photoURL" />
                            </q-avatar>
                            <q-avatar
                                v-else
                                color="secondary"
                                text-color="white"
                            >
                                <div>
                                    {{ user.displayName[0].toUpperCase() }}
                                </div>
                            </q-avatar>
                        </q-item-section>
                        <q-item-section>{{ user.displayName }}</q-item-section>
                        <q-item-section v-if="user.id !== currentUser.uid" side>
                            <q-btn
                                unelevated
                                flat
                                round
                                icon="person_remove"
                                color="red"
                                @click="onUserRemoveClicked(user.id)"
                            >
                                <q-tooltip
                                    class="bg-grey-9"
                                    :delay="500"
                                    :offset="[0, 10]"
                                    >Remove {{ user.displayName }} from
                                    board</q-tooltip
                                >
                            </q-btn>
                        </q-item-section>
                    </q-item>
                </q-list>
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
            currentUser: (state) => state.user.user,
        }),
    },
    mounted() {
        this.boardName =
            this.activeBoard !== undefined ? this.activeBoard.name : 'No Board'
    },
    watch: {
        activeBoard(val) {
            this.boardName = val !== undefined ? val.name : 'No Board'
        },
    },
    components: {},
    methods: {
        onBoardNameChange: function () {
            this.$store.dispatch('board/changeBoardName', {
                boardName: this.boardName,
            })
        },
        onUserRemoveClicked: function (id) {
            this.$emit('openRemoveUserDialog')
            this.bus.emit('onUserRemoveClick', id)
        },
    },
}
</script>

<style></style>
