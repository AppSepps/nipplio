<template>
    <q-page padding>
        <div class="row">
            <div class="col-8">
                <div v-if="activeBoard">
                    <q-btn-dropdown
                        split
                        color="grey-9"
                        :label="activeBoard.name"
                    >
                        <q-list>
                            <q-item
                                v-for="board in boards"
                                :key="board.id"
                                clickable
                                v-close-popup
                            >
                                <q-item-section>
                                    <q-item-label>{{
                                        board.name
                                    }}</q-item-label>
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
            <div class="col-8" v-if="currentUser">
                <h1 class="text-h5 q-mt-none">
                    Hello <strong>{{ currentUser.username }}</strong>
                </h1>
            </div>
            <div class="col-4" v-if="boardUsers.length > 0">
                <q-list bordered separator dark>
                    <q-item
                        clickable
                        v-ripple
                        v-for="user in boardUsers"
                        :key="user.id"
                    >
                        <q-item-section avatar>
                            <q-avatar color="secondary" text-color="white">
                                {{ user.username[0].toUpperCase() }}
                            </q-avatar>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>{{ user.username }}</q-item-label>
                            <q-item-label caption>Not connected</q-item-label>
                        </q-item-section>
                        <q-item-section avatar>
                            <q-icon color="negative" name="mic_off" />
                        </q-item-section>
                    </q-item>
                </q-list>
            </div>
        </div>
    </q-page>
</template>

<script>
import { User, UserBoard } from '../models'
import { DataStore } from '@aws-amplify/datastore'
import { Auth } from '@aws-amplify/auth'

export default {
    name: 'Home',
    components: {},
    data() {
        return {
            currentUser: undefined,
            boards: [],
            activeBoard: undefined,
            boardUsers: [],
        }
    },
    async mounted() {
        const authUser = await Auth.currentAuthenticatedUser()
        const users = await DataStore.query(User, (u) =>
            u.authUsername('eq', authUser.username)
        )
        const currentUser = users[0]
        this.currentUser = currentUser

        const userBoards = await DataStore.query(UserBoard)
        const boards = userBoards
            .filter((ub) => ub.user.id === currentUser.id)
            .map((ub) => ub.board)
        const activeBoard = boards[0]
        const boardUsers = userBoards
            .filter((ub) => ub.board.id === activeBoard.id)
            .map((ub) => ub.user)

        this.boards = boards
        this.activeBoard = activeBoard
        this.boardUsers = boardUsers
    },
    methods: {
        signOut: async function () {
            await Auth.signOut()
            this.$router.push('/login')
        },
    },
}
</script>

<style>
.home-container {
    padding: 20px;
}
</style>
