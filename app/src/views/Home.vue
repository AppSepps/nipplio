<template>
    <q-layout view="lHh LpR lFf" container style="height: 100vh">
        <q-header class="shadow-1">
            <q-toolbar class="bg-dark text-white">
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
        <board-select
            v-on:openAddBoardDialog="showAddBoardDialog = true"
            v-on:openCustomizeDialog="showCustomizeDialog = true"
        />
        <user-drawer v-if="activeBoard" />
        <q-page-container>
            <q-page padding>
                <div v-if="!activeBoard">
                    You are currently not connected with any board. Select a
                    board on the left side or create a new board.
                </div>
                <div v-else>
                    <!-- TODO: Extract sound table in extra component -->
                    <q-table
                        class="sound-table"
                        virtual-scroll
                        flat
                        separator="none"
                        :rows-per-page-options="[0]"
                        :rows="filteredSounds"
                        :columns="columns"
                        row-key="id"
                        hide-bottom
                    >
                        <template v-slot:top>
                            <div class="text-h6 text-bold">
                                Sounds ({{ filteredSounds.length }})
                            </div>
                            <q-space />
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
                        </template>
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
                                v-on:openEditDialog="showEditSoundDialog = true"
                                v-on:openInfoDialog="showSoundInfoDialog = true"
                            />
                        </template>
                    </q-table>
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
        <customize-dialog v-model="showCustomizeDialog" />
    </q-layout>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Settings from './Settings.vue'
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
import BoardSelect from '../components/BoardSelect.vue'
import CustomizeDialog from '../components/CustomizeDialog.vue'

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
        name: 'tags',
        sortable: false,
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
        BoardSelect,
        CustomizeDialog,
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
            showCustomizeDialog: false,
            columns,
        }
    },
    methods: {
        onUpdateTag: function(state) {
            console.log('onUpdateTag', state)
        },
        onClickTag: function(tagName) {
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
                return this.$store.state.sound.selectedTags
            },
            set(value) {
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
