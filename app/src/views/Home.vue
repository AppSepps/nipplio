<template>
    <q-layout view="lHh lpr lFf" container style="height: 100vh">
        <q-header>
            <q-toolbar class="bg-dark text-white">
                <board-dropdown
                    :boards="boards"
                    :activeBoard="activeBoard"
                    v-on:openDialog="showAddBoardDialog = true"
                />
                <board-invite
                    v-if="activeBoard && activeBoard.owner === user.uid"
                    class="q-ml-sm"
                    v-on:openDialog="showBoardInviteDialog = true"
                />
                <sound-upload class="q-ml-sm" v-if="activeBoard" />
                <q-space />
                <q-input
                    v-if="activeBoard"
                    dark
                    dense
                    standout
                    v-model="searchText"
                    class="q-mx-sm row"
                    placeholder="Search..."
                    style="width: 300px !important"
                >
                    <template v-slot:append>
                        <q-icon v-if="searchText === ''" name="search" />
                        <q-icon
                            v-else
                            name="clear"
                            class="cursor-pointer"
                            @click="searchText = ''"
                        />
                    </template>
                </q-input>
                <q-space />
                <q-badge color="primary">Alpha</q-badge>
                <self-mute-button :selfMute="selfMute" class="q-mx-sm" />
                <q-btn
                    unelevated
                    icon="settings"
                    color="grey-9"
                    @click="showSettingsModal = true"
                />
            </q-toolbar>
        </q-header>
        <q-page-container>
            <q-page padding>
                <div class="row">
                    <div v-if="!activeBoard">
                        You are currently not connected with any board. Select a
                        board with the button above or join a new board.
                    </div>
                    <div class="col-8 q-pr-md" v-if="activeBoard">
                        <q-list dark v-if="sounds && sounds.length > 0">
                            <q-item-label header class="text-uppercase"
                                >Sounds</q-item-label
                            >
                            <sound
                                v-for="sound in sortedSounds"
                                :key="sound.id"
                                :sound="sound"
                                :user="
                                    boardUsers.filter(
                                        (u) => u.id === sound.createdBy
                                    )[0]
                                "
                            />
                        </q-list>
                    </div>
                    <div
                        class="col-4"
                        v-if="boardUsers && boardUsers.length > 0"
                    >
                        <q-list dark>
                            <q-item-label header class="text-uppercase"
                                >Online –
                                {{ connectedUsers.length }}</q-item-label
                            >
                            <user
                                v-for="boardUser in connectedUsers"
                                :key="boardUser.id"
                                :user="boardUser"
                                :isCurrentUser="user.uid === boardUser.id"
                                :muted="mutedUsers.includes(boardUser.id)"
                            />
                        </q-list>
                        <q-list dark>
                            <q-item-label header class="text-uppercase"
                                >Offline –
                                {{ disconnectedUsers.length }}</q-item-label
                            >
                            <user
                                v-for="boardUser in disconnectedUsers"
                                :key="boardUser.id"
                                :user="boardUser"
                                :isCurrentUser="user.uid === boardUser.id"
                                :muted="mutedUsers.includes(boardUser.id)"
                            />
                        </q-list>
                    </div>
                </div>
            </q-page>
        </q-page-container>
        <q-footer v-if="activeBoard">
            <audio-player />
        </q-footer>
        <settings v-model="showSettingsModal" />
        <add-board-dialog
            v-model="showAddBoardDialog"
            v-on:closeDialog="showAddBoardDialog = false"
        />
        <board-invite-dialog v-model="showBoardInviteDialog" />
    </q-layout>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Settings from './Settings.vue'
import BoardDropdown from '../components/BoardDropdown.vue'
import Sound from '../components/Sound.vue'
import User from '../components/User.vue'
import SelfMuteButton from '../components/SelfMuteButton.vue'
import SoundUpload from '../components/SoundUpload.vue'
import BoardInvite from '../components/BoardInvite.vue'
import AddBoardDialog from '../components/AddBoardDialog.vue'
import AudioPlayer from '../components/AudioPlayer.vue'
import BoardInviteDialog from '../components/BoardInviteDialog.vue'

export default {
    name: 'Home',
    components: {
        Settings,
        Sound,
        User,
        BoardDropdown,
        SelfMuteButton,
        SoundUpload,
        BoardInvite,
        AddBoardDialog,
        AudioPlayer,
        BoardInviteDialog,
    },
    data() {
        return {
            searchText: '',
            showSettingsModal: false,
            showAddBoardDialog: false,
            showBoardInviteDialog: false,
        }
    },
    computed: {
        ...mapGetters('app', [
            'sortedSounds',
            'connectedUsers',
            'disconnectedUsers',
        ]),
        ...mapState({
            selfMute: (state) => state.app.selfMute,
            user: (state) => state.app.user,
            activeBoard: (state) => state.app.activeBoard,
            boardUsers: (state) => state.app.boardUsers,
            mutedUsers: (state) => state.app.mutedUsers,
            boards: (state) => state.app.boards,
            sounds: (state) => state.app.sounds,
        }),
    },
    async mounted() {
        await this.$store.dispatch('app/checkForInviteLinkInUrl')
        await this.$store.dispatch('app/getUser')
        await this.$store.dispatch('app/getBoards')
        await this.$store.dispatch('app/getSounds')
        await this.$store.dispatch('app/getBoardUsers')
        await this.$store.dispatch('app/unsubscribeToPlay')
        await this.$store.dispatch('app/subscribeToPlay')
        await this.$store.dispatch('app/updateConnectionStatus')
    },
    methods: {},
}
</script>

<style></style>
