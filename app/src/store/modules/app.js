import { PubSub } from 'aws-amplify'
import { User, UserBoard, Sound } from '../../models'
import { DataStore } from '@aws-amplify/datastore'
import { Auth } from '@aws-amplify/auth'

const state = {
    selfMute: false,
    activeBoard: undefined,
    user: undefined,
    boards: [],
    boardUsers: [],
    sounds: [],
}

const getters = {}

const actions = {
    async toggleSelfMute({ commit, state }) {
        const { selfMute } = state
        commit('toggleSelfMute', { selfMute: !selfMute })
    },
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
        const boardSounds = sounds.filter(
            (sound) => sound.board.id === activeBoard.id
        )
        commit('getBoardData', { boardUsers, boardSounds })
    },
    async playSound(action, params) {
        const { id } = params
        console.log('Play sound with id: ' + id)
        try {
            await PubSub.publish('myTopic1', {
                msg: 'Hello to all subscribers!',
            })
        } catch (e) {
            console.log(e)
        }
    },
    async toggleFavoriteSound(action, params) {
        const { id } = params
        action.commit('toggleFavoriteSound', { id })
    },
    async uploadSoundFile(action, params) {
        const { file, cbSuccess } = params
        console.log('Trying to upload file ' + file)
        cbSuccess()
    },
    async signOut({ commit }) {
        await Auth.signOut()
        commit('signOut')
    },
}

const mutations = {
    toggleSelfMute(state, { selfMute }) {
        state.selfMute = selfMute
    },
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
    toggleFavoriteSound(state, { id }) {
        // TODO: Better solution if new sounds are loaded or user signs out. Remote favorites?
        state.sounds = state.sounds.map((sound) => {
            if (sound.id === id) {
                return {
                    ...sound,
                    favorite: !sound.favorite,
                }
            }
            return sound
        })
    },
    signOut(state) {
        state.selfMute = false
        state.user = undefined
        state.boards = []
        state.activeBoard = undefined
        state.boardUsers = []
        state.sounds = []
    },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}
