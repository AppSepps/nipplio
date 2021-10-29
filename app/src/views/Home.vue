<template>
    <q-layout view="lHh LpR lFf" container style="height: 100vh">
        <q-header class="shadow-1">
            <q-toolbar class="bg-dark text-white">
                <board-title-dropdown
                    v-on:openInviteDialog="showBoardInviteDialog = true"
                    v-on:openLeaveBoardDialog="showLeaveBoardDialog = true"
                    v-on:openManageBoardDialog="showManageBoardDialog = true"
                />
                <q-space />
                <search-bar ref="searchBar" v-if="activeBoard" />
                <q-space />
                <q-btn
                    flat
                    @click="drawerLeft = !drawerLeft"
                    round
                    dense
                    class="q-ml-sm"
                    icon="group"
                />
            </q-toolbar>
        </q-header>
        <board-select
            v-on:openAddBoardDialog="showAddBoardDialog = true"
            v-on:openCustomizeDialog="showCustomizeDialog = true"
            v-on:openSettingsDialog="showSettingsModal = true"
        />
        <user-drawer v-if="activeBoard" v-model="drawerLeft" />
        <q-page-container>
            <q-page padding>
                <div v-if="!activeBoard">
                    You are currently not connected with any board. Select a
                    board on the left side or create a new board.
                </div>
                <div v-else-if="!areSoundsLoading">
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
                            <div v-if="availableTags.length > 0">
                                <q-chip
                                    v-for="tag in availableTags"
                                    clickable
                                    :key="tag"
                                    :selected="isSelected(tag)"
                                    @click="onClickTag(tag)"
                                    :color="
                                        isSelected(tag)
                                            ? 'primary'
                                            : 'secondary'
                                    "
                                    text-color="white"
                                >
                                    {{ tag }}
                                </q-chip>
                            </div>
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
                                        (u) => u.id === props.row.createdBy
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
        <remove-user-dialog v-model="showRemoveUserDialog" />
        <edit-sound-dialog v-model="showEditSoundDialog" />
        <sound-info-dialog v-model="showSoundInfoDialog" />
        <slot-mapping-dialog v-model="showSlotMappingDialog" />
        <customize-dialog v-model="showCustomizeDialog" />
        <leave-board-dialog v-model="showLeaveBoardDialog" />
        <manage-board-dialog
            v-model="showManageBoardDialog"
            v-on:openRemoveUserDialog="showRemoveUserDialog = true"
        />
    </q-layout>
</template>

<script>
import {ref} from 'vue'
import {mapGetters, mapState} from 'vuex'
import Settings from './Settings.vue'
import Sound from '../components/Sound.vue'
import AddBoardDialog from '../components/AddBoardDialog.vue'
import AudioPlayer from '../components/AudioPlayer.vue'
import BoardInviteDialog from '../components/BoardInviteDialog.vue'
import SearchBar from '../components/SearchBar.vue'
import RemoveSoundDialog from '../components/RemoveSoundDialog.vue'
import EditSoundDialog from '../components/EditSoundDialog.vue'
import SoundInfoDialog from '../components/SoundInfoDialog.vue'
import UserDrawer from '../components/UserDrawer.vue'
import SlotMappingDialog from '../components/SlotMappingDialog.vue'
import BoardSelect from '../components/BoardSelect.vue'
import CustomizeDialog from '../components/CustomizeDialog.vue'
import BoardTitleDropdown from '../components/BoardTitleDropdown.vue'
import LeaveBoardDialog from '../components/LeaveBoardDialog.vue'
import ManageBoardDialog from '../components/ManageBoardDialog.vue'
import RemoveUserDialog from '../components/RemoveUserDialog.vue'

const columns = [
    {
        name: 'name',
        required: true,
        label: 'Name',
        align: 'left',
        field: (row) => row.name,
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
        field: (row) => row.createdAt,
        sortable: true,
    },
]

export default {
    name: 'Home',
    components: {
        Settings,
        Sound,
        AddBoardDialog,
        AudioPlayer,
        BoardInviteDialog,
        RemoveSoundDialog,
        SearchBar,
        EditSoundDialog,
        SoundInfoDialog,
        UserDrawer,
        SlotMappingDialog,
        BoardSelect,
        CustomizeDialog,
        BoardTitleDropdown,
        LeaveBoardDialog,
        ManageBoardDialog,
        RemoveUserDialog,
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
            showLeaveBoardDialog: false,
            showManageBoardDialog: false,
            showRemoveUserDialog: false,
            columns,
            drawerLeft: ref(true),
        }
    },
    methods: {
        onUpdateTag: function (state) {
            console.log('onUpdateTag', state)
        },
        onClickTag: function (tagName) {
            return this.$store.dispatch('sound/onTagClicked', {
                tagName,
            })
        },
        isSelected: function (tagName) {
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
            activeBoard: (state) => state.board.activeBoard,
            areSoundsLoading: (state) => state.sound.areSoundsLoading,
            boardUsers: (state) => state.user.boardUsers,
            sounds: (state) => state.sound.sounds,
            user: (state) => state.user.user,
        }),
    },
    async mounted() {
        const that = this
        this.$store.dispatch('board/registerShortcuts', function () {
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
        await this.$store.dispatch('user/logAnalytics')
    },
}
</script>

<style></style>
