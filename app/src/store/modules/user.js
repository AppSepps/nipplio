import {sendToIPCRenderer} from '@/helpers/electron.helper'
import {getAnalytics, setUserProperties} from "firebase/analytics";
import {getDatabase, off, onChildAdded, onChildChanged, ref, update, set, onValue, child, onDisconnect} from "firebase/database";
import {getAuth} from "firebase/auth";

function initialState() {
    return {
        boardUsers: [],
        mutedUsers: [],
        user: undefined,
        speaker: undefined,
    }
}

const getters = {
    selfMute: state => state.user && state.mutedUsers.includes(state.user.uid),
    connectedUsers: state =>
        state.boardUsers.filter(boardUser => boardUser.connected),
    disconnectedUsers: state =>
        state.boardUsers.filter(boardUser => !boardUser.connected),
}

const actions = {
    async logAnalytics({rootState}) {
        setUserProperties(getAnalytics(), {
            themeId: rootState.theme.currentThemeId
        })
    },
    async getBoardUsers({rootState, commit}) {
        const {activeBoard} = rootState.board

        if (!activeBoard) return

        commit('emptyBoardUsers')
        const boardUsersRef = ref(getDatabase(), `/boardUsers/${activeBoard.id}`)
        off(boardUsersRef)

        onChildAdded(boardUsersRef, snapshot => {
            commit('addBoardUser', {
                id: snapshot.key,
                ...snapshot.val(),
            })
        })

        onChildChanged(boardUsersRef, snapshot => {
            commit('changeBoardUser', {
                id: snapshot.key,
                ...snapshot.val(),
            })
        })
    },
    getUser({commit}) {
        const user = getAuth().currentUser
        commit('getUser', {user})
    },
    async onSelfMuteToggle({state, rootState}, params) {
        const {selfMute} = params
        const {activeBoard} = rootState.board

        if (!activeBoard) return

        await update(ref(getDatabase(), `/boardUsers/${activeBoard.id}/${state.user.uid}`), { muted: selfMute })

        sendToIPCRenderer(selfMute ? 'setIconToMute' : 'setIconToUnmute')
    },
    selectSpeaker({commit}, params) {
        const {id} = params
        commit('selectSpeaker', {id})
    },
    toggleUserMute({commit, state}, params) {
        let {id, selfMute = false} = params
        if (selfMute) {
            id = state.user.uid
        }
        commit('toggleUserMute', {id})
    },
    async updateConnectionStatus({rootState, rootGetters}) {
        // TODO: Something here isnt working right
        const {activeBoard} = rootState.board

        if (!activeBoard) return

        const boardUserRef = ref(getDatabase(),
                `/boardUsers/${activeBoard.id}/${
                    getAuth().currentUser.uid
                }`
            )
        await set(boardUserRef, {
            displayName: getAuth().currentUser.displayName,
            photoURL: getAuth().currentUser.photoURL,
            connected: true,
            muted: rootGetters['user/selfMute'],
        })
        let connectedRef = ref(getDatabase(), '.info/connected')
        onValue(connectedRef, function (snap) {
            if (snap.val() === true) {
                onDisconnect(boardUserRef).update({
                    connected: false
                })
            }
        })
        // Keeps the user as connected when another tab gets closed
        onValue(child(boardUserRef, 'connected'),  snap => {
            if (snap.val() === false) {
                set(child(boardUserRef, 'connected'), true)
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
        state.boardUsers = state.boardUsers.map(u => {
            return u.id === user.id ? user : u
        })
    },
    getUser(state, {user}) {
        state.user = user
    },
    selectSpeaker(state, {id}) {
        if (state.speaker === id) {
            state.speaker = undefined
            state.mutedUsers = []
        } else {
            state.speaker = id
            state.mutedUsers = state.boardUsers
                .filter(user => user.id !== id)
                .map(user => user.id)
        }
    },
    toggleUserMute(state, {id}) {
        state.speaker = undefined
        state.mutedUsers = state.mutedUsers.includes(id)
            ? state.mutedUsers.filter(u => u !== id)
            : [...state.mutedUsers, id]
        if (state.boardUsers.length - 1 === state.mutedUsers.length) {
            const singleUser = state.boardUsers.filter(
                user => state.mutedUsers.indexOf(user.id) === -1
            )[0]
            state.speaker = singleUser.id
        }
    },
    reset(state) {
        const s = initialState()
        Object.keys(s).forEach(key => {
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
