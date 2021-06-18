<template>
    <q-page padding>
        <div class="row">
            <div class="col-10">
                <div v-if="activeBoard">
                    Verbunden mit
                    <strong>{{ activeBoard.name }}</strong>
                </div>
                <div v-if="currentUser">
                    Willkommen
                    <strong>{{ currentUser.username }}</strong>
                </div>
                <div v-if="boardUsers.length > 0">
                    <div>Verbundene Benutzer:</div>
                    <ul>
                        <li v-for="user in boardUsers" :key="user.id">
                            {{ user.username }}
                        </li>
                    </ul>
                </div>
            </div>
            <div class="col-2 text-right">
                <q-btn
                    unelevated
                    color="primary"
                    label="Sign out"
                    v-on:click="signOut"
                />
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
