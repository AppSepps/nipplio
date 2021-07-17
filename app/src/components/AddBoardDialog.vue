<template>
    <q-dialog @hide="onHide">
        <q-card>
            <q-card-section class="row items-center">
                <div class="text-h6">New board</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>
            <q-card-section class="q-p-none">
                <q-list>
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
                    <q-separator spaced />
                    <q-item clickable v-ripple @click="onJoinBoardClick">
                        <q-item-section avatar>
                            <q-avatar
                                color="secondary"
                                text-color="white"
                                icon="dashboard_customize"
                            />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Join board</q-item-label>
                            <q-item-label caption
                                >Click here to join an existing
                                board.</q-item-label
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
                        color="secondary"
                        v-model="inviteUrlText"
                        label="Invite Link"
                        placeholder="Paste in your invite link..."
                        :rules="[
                            val =>
                                (val && val.length > 0) ||
                                'Please type something',
                        ]"
                    >
                        <template v-slot:after>
                            <q-btn
                                :disabled="inviteUrlText.trim().length == 0"
                                round
                                dense
                                flat
                                color="secondary"
                                icon="send"
                                @click="onInviteUrlSend"
                            />
                        </template>
                    </q-input>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script>
export default {
    name: 'AddBoardDialog',
    components: {},
    data() {
        return {
            inviteUrlText: '',
            showJoinBoardInput: false,
            name: '',
        }
    },
    methods: {
        onHide: function() {
            this.showJoinBoardInput = false
            this.inviteUrlText = ''
        },
        onAddBoardClick: async function() {
            await this.$store.dispatch('app/createBoard', {
                boardName: 'NewBoardName' + (Math.random() * 1000).toFixed(0),
            })
            this.$emit('closeDialog')
        },
        onJoinBoardClick: function() {
            this.showJoinBoardInput = true
        },
        onInviteUrlSend: async function() {
            if (this.inviteUrlText.trim().length == 0) {
                return
            }
            await this.$store.dispatch('app/joinBoardWithUrl', {
                inviteUrl: this.inviteUrlText,
            })
            this.$emit('closeDialog')
        },
    },
}
</script>

<style></style>
