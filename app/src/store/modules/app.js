import { User, UserBoard } from '../../models'
import { DataStore } from '@aws-amplify/datastore'
import { Auth } from '@aws-amplify/auth'

const state = {
    activeBoard: undefined,
    user: undefined,
    boards: [],
    boardUsers: [],
}

const getters = {}

const actions = {
    async getUserAndBoardData({ commit }) {
        const authUser = await Auth.currentAuthenticatedUser()
        const users = await DataStore.query(User, (u) =>
            u.authUsername('eq', authUser.username)
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
        commit('getData', { currentUser, userBoards, activeBoard, boardUsers })
    },
    async signOut({ commit }) {
        await Auth.signOut()
        commit('signOut')
    },
}

const mutations = {
    getData(state, data) {
        const { currentUser, userBoards, activeBoard, boardUsers } = data
        state.user = currentUser
        state.boards = userBoards
        state.activeBoard = activeBoard
        state.boardUsers = boardUsers
    },
    signOut(state) {
        state.user = undefined
        state.boards = []
        state.activeBoard = undefined
        state.boardUsers = []
    },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
