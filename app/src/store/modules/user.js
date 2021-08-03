import firebase from 'firebase'
import { sendToIPCRenderer } from '../../helpers/electron.helper'

function initialState() {
    return {
        boardUsers: [],
        mutedUsers: [],
        user: undefined,
        speaker: undefined,
    }
}

const getters = {
    selfMute: (state) =>
        state.user && state.mutedUsers.includes(state.user.uid),
    connectedUsers: (state) =>
        state.boardUsers.filter((boardUser) => boardUser.connected),
    disconnectedUsers: (state) =>
        state.boardUsers.filter((boardUser) => !boardUser.connected),
}

const actions = {
    async getBoardUsers({ rootState, commit }) {
        const { activeBoard } = rootState.board

        if (!activeBoard) return

        commit('emptyBoardUsers')
        const boardUsersRef = firebase
            .database()
            .ref(`/boardUsers/${activeBoard.id}`)

        boardUsersRef.on('child_added', (snapshot) => {
            commit('addBoardUser', {
                id: snapshot.key,
                ...snapshot.val(),
            })
        })

        boardUsersRef.on('child_changed', (snapshot) => {
            commit('changeBoardUser', {
                id: snapshot.key,
                ...snapshot.val(),
            })
        })
    },
    getUser({ commit }) {
        const user = firebase.auth().currentUser
        commit('getUser', { user })
    },
    async onSelfMuteToggle({ state, rootState }, params) {
        const { selfMute } = params
        const { activeBoard } = rootState.board

        if (!activeBoard) return

        await firebase
            .database()
            .ref(`/boardUsers/${activeBoard.id}/${state.user.uid}`)
            .update({
                muted: selfMute,
            })

        sendToIPCRenderer(selfMute ? 'setIconToMute' : 'setIconToUnmute')
    },
    selectSpeaker({ commit }, params) {
        const { id } = params
        commit('selectSpeaker', { id })
    },
    toggleUserMute({ commit, state }, params) {
        let { id, selfMute = false } = params
        if (selfMute) {
            id = state.user.uid
        }
        commit('toggleUserMute', { id })
    },
    async updateConnectionStatus({ rootState, rootGetters }) {
        // TODO: Something here isnt working right
        const { activeBoard } = rootState.board

        if (!activeBoard) return

        const boardUserRef = firebase
            .database()
            .ref(
                `/boardUsers/${activeBoard.id}/${firebase.auth().currentUser.uid
                }`
            )
        await boardUserRef.set({
            displayName: firebase.auth().currentUser.displayName,
            photoURL: firebase.auth().currentUser.photoURL,
            connected: true,
            muted: rootGetters['user/selfMute'],
        })
        await boardUserRef.onDisconnect().update({
            connected: false,
        })
        // Keeps the user as connected when another tab gets closed
        boardUserRef.child('connected').on('value', (snap) => {
            if (snap.val() == false) {
                boardUserRef.child('connected').set(true)
            }
        })
    },
}

const mutations = {
    emptyBoardUsers(state) {
        state.boardUsers = []
    },
    addBoardUser(state, user) {
        state.boardUsers = [...state.boardUsers, user]
    },
    changeBoardUser(state, user) {
        state.boardUsers = state.boardUsers.map((u) => {
            return u.id === user.id ? user : u
        })
    },
    getUser(state, { user }) {
        state.user = user
    },
    selectSpeaker(state, { id }) {
        if (state.speaker === id) {
            state.speaker = undefined
            state.mutedUsers = []
        } else {
            state.speaker = id
            state.mutedUsers = state.boardUsers
                .filter((user) => user.id !== id)
                .map((user) => user.id)
        }
    },
    toggleUserMute(state, { id }) {
        state.speaker = undefined
        state.mutedUsers = state.mutedUsers.includes(id)
            ? state.mutedUsers.filter((u) => u !== id)
            : [...state.mutedUsers, id]
        if (state.boardUsers.length - 1 === state.mutedUsers.length) {
            const singleUser = state.boardUsers.filter(
                (user) => state.mutedUsers.indexOf(user.id) === -1
            )[0]
            state.speaker = singleUser.id
        }
    },
    reset(state) {
        const s = initialState()
        Object.keys(s).forEach((key) => {
            state[key] = s[key]
        })
    },
}

export default {
    namespaced: true,
    state: initialState,
    getters,
    actions,
    mutations,
}
