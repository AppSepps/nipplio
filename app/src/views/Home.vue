<template>
    <q-layout view="lHh lpr lFf" container style="height: 100vh">
        <q-header>
            <q-toolbar class="bg-dark text-white">
                <board-dropdown v-on:openDialog="showAddBoardDialog = true" />
                <board-invite
                    v-if="activeBoard && user && activeBoard.owner === user.uid"
                    class="q-ml-sm"
                    v-on:openDialog="showBoardInviteDialog = true"
                />
                <sound-upload class="q-ml-sm" v-if="activeBoard" />
                <q-space />
                <search-bar v-if="activeBoard" />
                <q-space />
                <volume-control />
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
                                >Sounds - {{ sounds.length }}</q-item-label
                            >
                            <sound
                                v-for="sound in filteredSounds"
                                :key="sound.id"
                                :sound="sound"
                                :user="
                                    boardUsers.filter(
                                        (u) => u.id === sound.createdBy
                                    )[0]
                                "
                                v-on:openRemoveDialog="
                                    showRemoveSoundDialog = true
                                "
                                v-on:openEditDialog="showEditSoundDialog = true"
                                v-on:openInfoDialog="showSoundInfoDialog = true"
                            />
                            <q-item v-if="filteredSounds.length === 0">
                                <q-item-label caption
                                    >No sounds found.</q-item-label
                                >
                            </q-item>
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
        <remove-sound-dialog v-model="showRemoveSoundDialog" />
        <edit-sound-dialog v-model="showEditSoundDialog" />
        <sound-info-dialog v-model="showSoundInfoDialog" />
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
import SearchBar from '../components/SearchBar.vue'
import RemoveSoundDialog from '../components/RemoveSoundDialog.vue'
import EditSoundDialog from '../components/EditSoundDialog.vue'
import SoundInfoDialog from '../components/SoundInfoDialog.vue'
import VolumeControl from '../components/VolumeControl.vue'

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
        RemoveSoundDialog,
        SearchBar,
        EditSoundDialog,
        SoundInfoDialog,
        VolumeControl,
    },
    data() {
        return {
            showSettingsModal: false,
            showAddBoardDialog: false,
            showBoardInviteDialog: false,
            showRemoveSoundDialog: false,
            showEditSoundDialog: false,
            showSoundInfoDialog: false,
        }
    },
    computed: {
        ...mapGetters('sound', ['filteredSounds']),
        ...mapGetters('app', ['connectedUsers', 'disconnectedUsers']),
        ...mapState({
            selfMute: (state) => state.sound.selfMute,
            user: (state) => state.app.user,
            activeBoard: (state) => state.board.activeBoard,
            boardUsers: (state) => state.app.boardUsers,
            mutedUsers: (state) => state.app.mutedUsers,
            sounds: (state) => state.sound.sounds,
        }),
    },
    async mounted() {
        await this.$store.dispatch('board/checkForInviteLinkInUrl')
        await this.$store.dispatch('board/getBoards')
        await this.$store.dispatch('app/getUser')
        await this.$store.dispatch('sound/getSounds')
        await this.$store.dispatch('app/getBoardUsers')
        await this.$store.dispatch('sound/unsubscribeToPlay')
        await this.$store.dispatch('sound/subscribeToPlay')
        await this.$store.dispatch('app/updateConnectionStatus')
    },
}
</script>

<style></style>
