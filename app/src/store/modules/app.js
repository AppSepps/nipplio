import { User, UserBoard, Sound } from '../../models'
import { DataStore } from '@aws-amplify/datastore'
import { Auth } from '@aws-amplify/auth'

const state = {
    activeBoard: undefined,
    user: undefined,
    boards: [],
    boardUsers: [],
    sounds: [],
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
        commit('selectBoard', { activeBoard })
    },
    async getBoardData({ commit, state }) {
        const { activeBoard } = state
        const userBoards = await DataStore.query(UserBoard)
        const activeUserBoard = userBoards.filter(
            (ub) => ub.board.id === activeBoard.id
        )
        const boardUsers = activeUserBoard.map((ub) => ub.user)
        const sounds = await DataStore.query(Sound)
        console.log(sounds)
        const boardSounds = sounds.filter(
            (sound) => sound.board.id === activeBoard.id
        )
        commit('getBoardData', { boardUsers, boardSounds })
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
    selectBoard(state, { activeBoard }) {
        state.activeBoard = activeBoard
    },
    getBoardData(state, { boardUsers, boardSounds }) {
        state.boardUsers = boardUsers
        state.sounds = boardSounds
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
