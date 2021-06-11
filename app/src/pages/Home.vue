<template>
    <div class="home-container">Home</div>
</template>

<script>
import { User, UserBoard } from '../models'
import { DataStore } from '@aws-amplify/datastore'
import { Auth } from '@aws-amplify/auth'

export default {
    name: 'Home',
    components: {},
    async mounted() {
        const authUser = await Auth.currentAuthenticatedUser()
        console.log(authUser)
        const users = await DataStore.query(User, (u) =>
            u.email('eq', 'jan-patrick.hespelt@wuerth-it.com')
        )
        const currentUser = users[0]
        const userBoards = await DataStore.query(UserBoard)
        const boards = userBoards
            .filter((ub) => ub.user.id === currentUser.id)
            .map((ub) => ub.board)
        const activeBoard = boards[0]
        const boardUsers = userBoards
            .filter((ub) => ub.board.id === activeBoard.id)
            .map((ub) => ub.user)
        console.log(boardUsers)
    },
}
</script>

<style>
.home-container {
    color: #fff;
    padding: 20px;
}
</style>
