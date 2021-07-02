<template>
    <div>
        <q-page padding>
            <div class="row">
                <div class="col-8">
                    <board-dropdown
                        :boards="boards"
                        :activeBoard="activeBoard"
                    />
                </div>
                <div class="col-4 text-right q-gutter-sm q-ml-none">
                    <q-badge color="primary">Alpha</q-badge>
                    <q-btn
                        unelevated
                        icon="settings"
                        color="grey-9"
                        @click="showSettingsModal = true"
                    />
                </div>
            </div>
            <div class="row q-pt-md">
                <div class="col-12 q-pb-md" v-if="user">
                    <h1 class="text-h5 q-mt-none">
                        Hello <strong>{{ user.username }}</strong>
                    </h1>
                    <div v-if="activeBoard">
                        You are currently connected with
                        <strong>{{ activeBoard.name }}</strong>
                    </div>
                    <div v-else>
                        You are currently not connected with any board. Select a
                        board with the button above or join a new board.
                    </div>
                </div>
                <div class="col-8 q-pr-md">
                    <div class="row q-pb-md">
                        <q-input
                            class="col-9 q-pr-md"
                            outlined
                            v-model="searchText"
                            placeholder="Search"
                            dense
                        >
                            <template v-slot:prepend>
                                <q-icon name="search" />
                            </template>
                            <template v-slot:append>
                                <q-icon
                                    v-if="searchText !== ''"
                                    name="close"
                                    @click="searchText = ''"
                                    class="cursor-pointer"
                                />
                            </template>
                        </q-input>
                        <q-btn
                            class="col-3"
                            no-caps
                            unelevated
                            color="secondary"
                        >
                            <q-icon left name="upload" />
                            <div>Upload</div>
                        </q-btn>
                    </div>
                    <q-list
                        bordered
                        separator
                        dark
                        v-if="sounds && sounds.length > 0"
                    >
                        <sound
                            v-for="sound in sounds"
                            :key="sound.id"
                            :sound="sound"
                        />
                    </q-list>
                </div>
                <div class="col-4" v-if="boardUsers && boardUsers.length > 0">
                    <q-list bordered separator dark>
                        <user
                            v-for="user in boardUsers"
                            :key="user.id"
                            :user="user"
                        />
                    </q-list>
                </div>
            </div>
        </q-page>
        <settings v-model="showSettingsModal" />
    </div>
</template>

<script>
import Settings from './Settings.vue'
import BoardDropdown from '../components/BoardDropdown.vue'
import Sound from '../components/Sound.vue'
import User from '../components/User.vue'
import { mapState } from 'vuex'

export default {
    name: 'Home',
    components: { Settings, Sound, User, BoardDropdown },
    data() {
        return {
            searchText: '',
            showSettingsModal: false,
        }
    },
    computed: mapState({
        user: state => state.app.user,
        activeBoard: state => state.app.activeBoard,
        boardUsers: state => state.app.boardUsers,
        boards: state => state.app.boards,
        sounds: state => state.app.sounds,
    }),
    async mounted() {
        await this.$store.dispatch('app/getUser')
        await this.$store.dispatch('app/getBoards')
    },
    methods: {},
}
</script>

<style></style>
