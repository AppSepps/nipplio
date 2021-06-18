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
    async getUser({ commit }) {
        const authUser = await Auth.currentAuthenticatedUser()
        const users = await DataStore.query(User, (u) =>
            u.authUsername('eq', authUser.username)
        )
        const user = users[0]
        commit('getUser', { user })
    },
    async getBoards({ commit, state }) {
        const userBoards = await DataStore.query(UserBoard)
        const boards = userBoards
            .filter((ub) => ub.user.id === state.user.id)
            .map((ub) => ub.board)
        commit('getBoards', { boards })
    },
    async selectBoard({ commit }, params) {
        const { id } = params
        const userBoards = await DataStore.query(UserBoard)
        const filteredUserBoards = userBoards.filter((ub) => ub.board.id === id)
        const activeBoard = filteredUserBoards[0].board
        const boardUsers = filteredUserBoards.map((ub) => ub.user)
        commit('selectBoard', { activeBoard, boardUsers })
    },
    async signOut({ commit }) {
        await Auth.signOut()
        commit('signOut')
    },
}

const mutations = {
    getUser(state, { user }) {
        state.user = user
    },
    getBoards(state, { boards }) {
        state.boards = boards
    },
    selectBoard(state, { activeBoard, boardUsers }) {
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
