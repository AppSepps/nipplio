import firebase from 'firebase'
import { useRoute } from 'vue-router'

function initialState() {
    return {
        activeBoard: undefined,
        boards: [],
    }
}

const getters = {}

const actions = {
    checkForInviteLinkInUrl({ dispatch }) {
        const params = useRoute().query
        if (params) {
            const { boardId, token } = params
            if (boardId && token) {
                dispatch('joinBoard', { token, boardId })
            }
        }
    },
    async inviteUser({ state }, params) {
        const { activeBoard } = state
        const { cb } = params
        const snapshot = await firebase
            .database()
            .ref('/boardInvites/' + activeBoard.id)
            .push(true)
        const url = `${window.location.origin}${window.location.pathname}?boardId=${activeBoard.id}&token=${snapshot.key}`
        cb(url)
    },
    joinBoardWithUrl({ dispatch }, params) {
        const { inviteUrl } = params
        const url = new URL(inviteUrl)
        const boardId = url.searchParams.get('boardId')
        const token = url.searchParams.get('token')
        dispatch('joinBoard', { boardId, token })
    },
    async joinBoard({ dispatch }, params) {
        const { boardId, token } = params
        const inviteUserByToken = firebase
            .functions()
            .httpsCallable('addUserByInvite')
        try {
            await inviteUserByToken({
                boardId: boardId,
                token: token,
            }) // TODO: Check response result
            dispatch('selectBoard', { boardId })
        } catch (error) {
            console.log(error)
        }
    },
    async createBoard(context, params) {
        const { boardName } = params
        const createBoard = firebase.functions().httpsCallable('createBoard')
        await createBoard({ boardName })
    },
    async getBoards({ commit }) {
        const boardsRef = firebase
            .database()
            .ref('/users/' + firebase.auth().currentUser.uid + '/boards')

        boardsRef.on('child_added', (snapshot) => {
            firebase
                .database()
                .ref('/boards/' + snapshot.key + '/')
                .on('value', (snapshot) => {
                    commit('addBoard', {
                        id: snapshot.key,
                        ...snapshot.val(),
                    })
                })
        })
    },
    selectBoard({ commit, state, dispatch }, params) {
        const { boards } = state
        const { id } = params
        const activeBoard = boards.filter((board) => board.id === id)[0]

        if (!activeBoard) return

        commit('selectBoard', activeBoard)
        dispatch('app/updateConnectionStatus', null, { root: true }) // TODO: Mark previous board as disconnected
        dispatch('app/getBoardUsers', null, { root: true })
        dispatch('app/getSounds', null, { root: true })
        dispatch('app/unsubscribeToPlay', null, { root: true })
        dispatch('app/subscribeToPlay', { skipInitial: false }, { root: true })
    },
}

const mutations = {
    addBoard(state, board) {
        state.boards = [...state.boards, board]
    },
    selectBoard(state, activeBoard) {
        state.activeBoard = activeBoard
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
