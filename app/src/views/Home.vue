<template>
    <q-layout view="hHh LpR fff" container style="height: 100vh">
        <q-header class="shadow-1">
            <q-toolbar class="bg-dark text-white">
                <board-dropdown v-on:openDialog="showAddBoardDialog = true" />
                <sound-upload class="q-ml-sm" v-if="activeBoard" />
                <board-invite
                    v-if="activeBoard && user && activeBoard.owner === user.uid"
                    class="q-mx-sm"
                    v-on:openDialog="showBoardInviteDialog = true"
                />

                <q-space />
                <search-bar ref="searchBar" v-if="activeBoard" />
                <q-space />
                <manage-board-button
                    v-if="activeBoard && user && activeBoard.owner === user.uid"
                />
                <q-btn
                    unelevated
                    icon="settings"
                    color="grey-9"
                    class="q-ml-sm"
                    @click="showSettingsModal = true"
                />
            </q-toolbar>
        </q-header>
        <user-drawer v-if="activeBoard" />
        <q-page-container>
            <q-page padding>
                <div v-if="!activeBoard">
                    You are currently not connected with any board. Select a
                    board with the button above or join a new board.
                </div>
                <div v-else>
                    <div class="q-pr-md">
                        <q-item-label header class="text-uppercase"
                            >Sounds - {{ filteredSounds.length }}</q-item-label
                        >
                        <q-item v-if="availableTags.length > 0">
                            <q-chip
                                v-for="tag in availableTags"
                                clickable
                                :key="tag"
                                :selected="isSelected(tag)"
                                @click="onClickTag(tag)"
                                color="secondary"
                                text-color="white"
                            >
                                {{ tag }}
                            </q-chip>
                        </q-item>
                        <q-table
                            virtual-scroll
                            separator="none"
                            :rows-per-page-options="[0]"
                            :rows="filteredSounds"
                            :columns="columns"
                            row-key="id"
                        >
                            <template v-slot:header="props">
                                <q-tr :props="props">
                                    <q-th auto-width />
                                    <q-th
                                        v-for="col in props.cols"
                                        :key="col.name"
                                        :props="props"
                                    >
                                        {{ col.label }}
                                    </q-th>
                                    <q-th auto-width />
                                </q-tr>
                            </template>

                            <template v-slot:body="props">
                                <sound
                                    :key="props.row.id"
                                    :props="props"
                                    :sound="props.row"
                                    :user="
                                        boardUsers.filter(
                                            u => u.id === props.row.createdBy
                                        )[0]
                                    "
                                    v-on:openRemoveDialog="
                                        showRemoveSoundDialog = true
                                    "
                                    v-on:openEditDialog="
                                        showEditSoundDialog = true
                                    "
                                    v-on:openInfoDialog="
                                        showSoundInfoDialog = true
                                    "
                                />
                            </template>
                        </q-table>
                        <!--q-list dark v-if="sounds && sounds.length > 0">
                            <q-item-label header class="text-uppercase"
                                >Sounds -
                                {{ filteredSounds.length }}</q-item-label
                            >
                            <sound
                                v-for="(sound, index) in filteredSounds"
                                :key="sound.id"
                                :sound="sound"
                                :index="index + 1"
                                :user="
                                    boardUsers.filter(
                                        u => u.id === sound.createdBy
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
                        </q-list-->
                    </div>
                </div>
            </q-page>
        </q-page-container>
        <q-footer v-if="activeBoard">
            <audio-player />
        </q-footer>
        <settings
            v-model="showSettingsModal"
            v-on:openSlotMappingDialog="showSlotMappingDialog = true"
        />
        <add-board-dialog
            v-model="showAddBoardDialog"
            v-on:closeDialog="showAddBoardDialog = false"
        />
        <board-invite-dialog v-model="showBoardInviteDialog" />
        <remove-sound-dialog v-model="showRemoveSoundDialog" />
        <edit-sound-dialog v-model="showEditSoundDialog" />
        <sound-info-dialog v-model="showSoundInfoDialog" />
        <slot-mapping-dialog v-model="showSlotMappingDialog" />
    </q-layout>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Settings from './Settings.vue'
import BoardDropdown from '../components/BoardDropdown.vue'
import Sound from '../components/Sound.vue'
import SoundUpload from '../components/SoundUpload.vue'
import BoardInvite from '../components/BoardInvite.vue'
import AddBoardDialog from '../components/AddBoardDialog.vue'
import AudioPlayer from '../components/AudioPlayer.vue'
import BoardInviteDialog from '../components/BoardInviteDialog.vue'
import SearchBar from '../components/SearchBar.vue'
import RemoveSoundDialog from '../components/RemoveSoundDialog.vue'
import EditSoundDialog from '../components/EditSoundDialog.vue'
import SoundInfoDialog from '../components/SoundInfoDialog.vue'
import ManageBoardButton from '../components/ManageBoardButton.vue'
import UserDrawer from '../components/UserDrawer.vue'
import SlotMappingDialog from '../components/SlotMappingDialog.vue'

const columns = [
    {
        name: 'name',
        required: true,
        label: 'Name',
        align: 'left',
        field: row => row.name,
        sortable: true,
    },
    {
        name: 'createdAt',
        required: true,
        label: 'Created at',
        field: row => row.createdAt,
        sortable: true,
    },
]

export default {
    name: 'Home',
    components: {
        Settings,
        Sound,
        BoardDropdown,
        SoundUpload,
        BoardInvite,
        AddBoardDialog,
        AudioPlayer,
        BoardInviteDialog,
        RemoveSoundDialog,
        SearchBar,
        EditSoundDialog,
        SoundInfoDialog,
        ManageBoardButton,
        UserDrawer,
        SlotMappingDialog,
    },
    data() {
        return {
            showSettingsModal: false,
            showAddBoardDialog: false,
            showBoardInviteDialog: false,
            showRemoveSoundDialog: false,
            showEditSoundDialog: false,
            showSoundInfoDialog: false,
            showSlotMappingDialog: false,
            columns,
        }
    },
    methods: {
        onUpdateTag: function(state) {
            console.log('onUpdateTag', state)
        },
        onClickTag: function(tagName) {
            console.log('onClickTag', tagName)
            return this.$store.dispatch('sound/onTagClicked', {
                tagName,
            })
        },
        isSelected: function(tagName) {
            return this.$store.state.sound.selectedTags.includes(tagName)
        },
    },
    computed: {
        selectedTags: {
            get() {
                console.log(this.$store.state.sound.selectedTags)
                return this.$store.state.sound.selectedTags
            },
            set(value) {
                console.log(value)
                return value
            },
        },
        ...mapGetters('sound', ['filteredSounds', 'availableTags']),
        ...mapState({
            activeBoard: state => state.board.activeBoard,
            boardUsers: state => state.user.boardUsers,
            sounds: state => state.sound.sounds,
            user: state => state.user.user,
        }),
    },
    async mounted() {
        const that = this

        this.$store.dispatch('board/registerShortcuts', function() {
            console.log('should focus')
            that.$refs.searchBar.focus()
        })
        await this.$store.dispatch('board/checkForInviteLinkInUrl')
        await this.$store.dispatch('board/getBoards')
        await this.$store.dispatch('user/getUser')
        await this.$store.dispatch('user/getBoardUsers')
        await this.$store.dispatch('user/updateConnectionStatus')
        await this.$store.dispatch('sound/getSounds')
        await this.$store.dispatch('player/unsubscribeToPlayer')
        await this.$store.dispatch('player/subscribeToPlayer')
        await this.$store.dispatch('player/subscribeToRemotePlayer')
        await this.$store.dispatch('settings/subscribeToRemoteDevices')
        await this.$store.dispatch('board/getApiKeys')
    },
}
</script>

<style></style>
