import firebase from 'firebase'

function initialState() {
    return {
        user: undefined,
        boardUsers: [],
        mutedUsers: [],
    }
}

const getters = {
    connectedUsers: (state) =>
        state.boardUsers.filter((boardUser) => boardUser.connected),
    disconnectedUsers: (state) =>
        state.boardUsers.filter((boardUser) => !boardUser.connected),
}

// TODO: Better modularization
const actions = {
    async getUser({ commit }) {
        const user = firebase.auth().currentUser
        commit('getUser', { user })
    },
    async getBoardUsers({ rootState, commit }) {
        const { activeBoard } = rootState.board

        if (!activeBoard) return

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
    async updateConnectionStatus({ rootState }) {
        const { selfMute } = rootState.sound
        const { activeBoard } = rootState.board

        if (!activeBoard) return

        const boardUserRef = firebase
            .database()
            .ref(
                `/boardUsers/${activeBoard.id}/${
                    firebase.auth().currentUser.uid
                }`
            )
        await boardUserRef.set({
            displayName: firebase.auth().currentUser.displayName,
            photoURL: firebase.auth().currentUser.photoURL,
            connected: true,
            muted: selfMute,
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
    async toggleUserMute(action, params) {
        const { id } = params
        action.commit('toggleUserMute', { id })
    },
}

const mutations = {
    getUser(state, { user }) {
        state.user = user
    },
    addBoardUser(state, user) {
        state.boardUsers = [...state.boardUsers, user]
    },
    changeBoardUser(state, user) {
        state.boardUsers = state.boardUsers.map((u) => {
            return u.id === user.id ? user : u
        })
    },
    toggleUserMute(state, { id }) {
        state.mutedUsers = state.mutedUsers.includes(id)
            ? state.mutedUsers.filter((u) => u !== id)
            : [...state.mutedUsers, id]
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
