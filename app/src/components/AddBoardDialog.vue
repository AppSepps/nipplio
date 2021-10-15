<template>
    <q-dialog @hide="onHide">
        <q-card style="width: 450px; max-width: 80vw">
            <q-card-section class="row items-center">
                <div class="text-h6">New board</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>
            <q-card-section v-if="!isCreateBoardLoading" class="q-p-none">
                <q-list class="q-pb-md">
                    <q-item clickable v-ripple @click="onAddBoardClick">
                        <q-item-section avatar>
                            <q-avatar
                                color="primary"
                                text-color="white"
                                icon="add"
                            />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Create board</q-item-label>
                            <q-item-label caption
                                >Click here to create a new board</q-item-label
                            >
                        </q-item-section>
                    </q-item>
                    <q-item clickable v-ripple @click="onJoinBoardClick">
                        <q-item-section avatar>
                            <q-avatar
                                color="secondary"
                                text-color="white"
                                icon="link"
                            />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Join board</q-item-label>
                            <q-item-label caption
                                >Click here to join an existing
                                board</q-item-label
                            >
                        </q-item-section>
                    </q-item>
                </q-list>
                <q-form
                    @submit="onInviteUrlSend"
                    class="q-gutter-md"
                    v-if="showJoinBoardInput"
                >
                    <q-input
                        filled
                        dense
                        v-model="inviteUrlText"
                        label="Invite Link"
                        placeholder="Paste in your invite link..."
                        :rules="[
                            (val) =>
                                (val && val.length > 0) ||
                                'Please type something',
                        ]"
                    >
                        <template v-slot:after>
                            <q-btn
                                :disabled="inviteUrlText.trim().length == 0"
                                color="primary"
                                icon="send"
                                @click="onInviteUrlSend"
                            />
                        </template>
                    </q-input>
                </q-form>
                <q-form
                    @submit="onAddBoardSend"
                    class="q-gutter-md"
                    v-if="showCreateBoardInput"
                >
                    <q-input
                        filled
                        dense
                        v-model="boardName"
                        label="Board Name"
                        placeholder="BraveBoardBuddies"
                        :rules="[
                            (val) =>
                                (val && val.length > 0) ||
                                'Please type something',
                        ]"
                    >
                        <template v-slot:after>
                            <q-btn
                                :disabled="boardName.trim().length == 0"
                                color="primary"
                                icon="send"
                                @click="onAddBoardSend"
                            />
                        </template>
                    </q-input>
                </q-form>
            </q-card-section>
            <q-card-section v-else class="q-p-none text-center">
                <q-spinner color="primary" size="4em" />
                <div class="text-body1 q-my-md">Board is created...</div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'AddBoardDialog',
    data() {
        return {
            inviteUrlText: '',
            boardName: '',
            showJoinBoardInput: false,
            showCreateBoardInput: false,
        }
    },
    computed: {
        ...mapState({
            isCreateBoardLoading: (state) => state.board.isCreateBoardLoading,
        }),
    },
    methods: {
        onHide: function () {
            this.showJoinBoardInput = false
            this.showCreateBoardInput = false
            this.inviteUrlText = ''
        },
        onAddBoardClick: async function () {
            this.showCreateBoardInput = true
            this.showJoinBoardInput = false
        },
        onAddBoardSend: async function () {
            if (this.boardName.trim().length == 0) {
                return
            }
            await this.$store.dispatch('board/createBoard', {
                boardName: this.boardName,
                cb: () => {
                    this.$emit('closeDialog')
                },
            })
        },
        onJoinBoardClick: function () {
            this.showJoinBoardInput = true
            this.showCreateBoardInput = false
        },
        onInviteUrlSend: async function () {
            if (this.inviteUrlText.trim().length == 0) {
                return
            }
            await this.$store.dispatch('board/joinBoardWithUrl', {
                inviteUrl: this.inviteUrlText,
            })
            this.$emit('closeDialog')
        },
    },
}
</script>

<style></style>
