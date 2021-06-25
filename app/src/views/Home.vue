<template>
    <div>
        <q-page padding>
            <div class="row">
                <div class="col-8">
                    <div>
                        <q-btn-dropdown split color="primary" label="Boards">
                            <q-list>
                                <q-item
                                    v-for="board in boards"
                                    :key="board.id"
                                    clickable
                                    v-close-popup
                                    @click="onBoardClick(board.id)"
                                >
                                    <q-item-section>
                                        <q-item-label>{{
                                            board.name
                                        }}</q-item-label>
                                    </q-item-section>
                                    <q-item-section avatar>
                                        <q-icon
                                            v-if="
                                                activeBoard &&
                                                activeBoard.id === board.id
                                            "
                                            color="primary"
                                            name="check"
                                        />
                                        <q-icon
                                            v-else
                                            color="white"
                                            name="web"
                                        />
                                    </q-item-section>
                                </q-item>
                                <q-item
                                    clickable
                                    v-close-popup
                                    @click="onJoinNewBoardClick"
                                >
                                    <q-item-section>
                                        <q-item-label>Join Board</q-item-label>
                                        <q-item-label caption
                                            >Click here to join a new
                                            board</q-item-label
                                        >
                                    </q-item-section>
                                    <q-item-section avatar>
                                        <q-icon color="white" name="add" />
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </q-btn-dropdown>
                    </div>
                </div>
                <div class="col-4 text-right q-gutter-sm q-ml-none">
                    <q-btn unelevated icon="settings" color="grey-9" />
                    <q-btn
                        no-caps
                        unelevated
                        color="grey-9"
                        label="Sign out"
                        v-on:click="signOut"
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
                        <q-item v-for="sound in sounds" :key="sound.id">
                            <q-item-section avatar>
                                <q-btn
                                    unelevated
                                    round
                                    icon="play_arrow"
                                    color="positive"
                                    @click="onSoundPlay(sound.id)"
                                />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>{{ sound.name }}</q-item-label>
                                <q-item-label caption>{{
                                    sound['User'].username
                                }}</q-item-label>
                            </q-item-section>
                            <q-item-section avatar>
                                <q-btn
                                    unelevated
                                    flat
                                    round
                                    icon="favorite_border"
                                    color="negative"
                                />
                            </q-item-section>
                        </q-item>
                    </q-list>
                </div>
                <div class="col-4" v-if="boardUsers && boardUsers.length > 0">
                    <q-list bordered separator dark>
                        <q-item v-for="user in boardUsers" :key="user.id">
                            <q-item-section avatar>
                                <q-avatar color="secondary" text-color="white">
                                    {{ user.username[0].toUpperCase() }}
                                </q-avatar>
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>{{ user.username }}</q-item-label>
                                <q-item-label caption
                                    >Not connected</q-item-label
                                >
                            </q-item-section>
                            <q-item-section avatar>
                                <q-btn
                                    unelevated
                                    flat
                                    round
                                    icon="mic_off"
                                    color="negative"
                                />
                            </q-item-section>
                        </q-item>
                    </q-list>
                </div>
            </div>
        </q-page>
        <settings />
    </div>
</template>

<script>
import Settings from './Settings.vue'
import { mapState } from 'vuex'

export default {
    name: 'Home',
    components: { Settings },
    data() {
        return {
            searchText: '',
        }
    },
    computed: mapState({
        user: (state) => state.app.user,
        activeBoard: (state) => state.app.activeBoard,
        boardUsers: (state) => state.app.boardUsers,
        boards: (state) => state.app.boards,
        sounds: (state) => state.app.sounds,
    }),
    async mounted() {
        await this.$store.dispatch('app/getUser')
        await this.$store.dispatch('app/getBoards')
    },
    methods: {
        signOut: function () {
            this.$store.dispatch('app/signOut')
            this.$router.push('/login')
        },
        onBoardClick: async function (id) {
            await this.$store.dispatch('app/selectBoard', { id })
            await this.$store.dispatch('app/getBoardData')
        },
        onJoinNewBoardClick: function () {
            console.log('Trying to join a new board')
        },
        onSoundPlay: async function (id) {
            await this.$store.dispatch('app/playSound', { id })
        },
    },
}
</script>

<style>
.home-container {
    padding: 20px;
}
</style>
