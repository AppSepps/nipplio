import firebase from 'firebase'
import hotkeys from 'hotkeys-js'
import {sendToIPCRenderer} from '../../helpers/electron.helper'

function initialState() {
    return {
        lastActiveBoard: undefined,
        activeBoard: undefined,
        apiKeys: [],
        boards: [],
        isCreateBoardLoading: false,
    }
}

const getters = {
    isOwner: function (state, getters, rootState) {
        return (
            rootState.board.activeBoard.owner ===
            firebase.auth().currentUser.uid
        )
    },
    sortedBoards: (state) =>
        state.boards.sort((a, b) =>
            a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        ),
}

const actions = {
    unmountBoard({commit}) {
        commit('unmountBoard')
    },
    checkForInviteLinkInUrl({dispatch}, query) {
        const params = query
        if (params) {
            const {boardId, token} = params
            if (boardId && token) {
                dispatch('joinBoard', {token, boardId})
            }
        }
    },
    async changeBoardName({state}, params) {
        const {activeBoard} = state
        const {boardName} = params

        await firebase.database().ref(`/boards/${activeBoard.id}`).update({
            name: boardName,
        })
    },
    async createBoard({commit}, params) {
        const {boardName, cb} = params
        commit('setCreateBoardLoading', true)
        const createBoard = firebase.functions().httpsCallable('createBoard')
        await createBoard({boardName})
        cb()
        commit('setCreateBoardLoading', false)
        // TODO: selectBoard (Do we get board id from response?)
    },
    async getApiKeys({commit, state}) {
        if (state.activeBoard === undefined) return
        firebase
            .database()
            .ref(`/apiKeys/${state.activeBoard.id}/`)
            .on('value', (snapshot) => {
                let apiKeys = []
                snapshot.forEach((apiKey) => {
                    apiKeys.push(apiKey.key)
                })
                commit('setApiKeys', apiKeys)
            })
    },
    async getBoards({commit}) {
        const userBoardsRef = firebase
            .database()
            .ref('/users/' + firebase.auth().currentUser.uid + '/boards')

        userBoardsRef.on('child_added', (snapshot) => {
            const boardRef = firebase.database().ref('/boards/' + snapshot.key)

            boardRef.once('value').then((boardSnapshot) => {
                commit('addBoard', {
                    id: boardSnapshot.key,
                    ...boardSnapshot.val(),
                })

                boardRef.on('child_changed', (snapshot) => {
                    commit('changeBoard', {
                        id: boardSnapshot.key,
                        ...boardSnapshot.val(),
                        [snapshot.key]: snapshot.val(),
                    })
                })

                boardRef.on('child_removed', (snapshot) => {
                    commit('removeBoard', {
                        id: snapshot.key,
                    })
                })
            })
        })
    },
    async inviteUser({state}, params) {
        const {activeBoard} = state
        const {cb} = params
        const snapshot = await firebase
            .database()
            .ref('/boardInvites/' + activeBoard.id)
            .push(true)
        const url = `${window.location.origin}${window.location.pathname}?boardId=${activeBoard.id}&token=${snapshot.key}`
        cb(url)
    },
    async joinBoard({dispatch}, params) {
        const {boardId, token} = params
        const inviteUserByToken = firebase
            .functions()
            .httpsCallable('addUserByInvite')
        try {
            await inviteUserByToken({
                boardId: boardId,
                token: token,
            }) // TODO: Check response result
            dispatch('selectBoard', {boardId})
        } catch (error) {
            console.log(error)
        }
    },
    joinBoardWithUrl({dispatch}, params) {
        const {inviteUrl} = params
        const url = new URL(inviteUrl)
        const boardId = url.searchParams.get('boardId')
        const token = url.searchParams.get('token')
        dispatch('joinBoard', {boardId, token})
    },
    registerShortcuts({dispatch, rootGetters, rootState}, focusCallback) {
        hotkeys('*', async function (event) {
            if (event.key.match(/^[1-9]$/)) {
                const id = rootGetters['sound/filteredSounds'][event.key - 1].id
                dispatch('player/playRemoteSound', {id}, {root: true})
            } else if (event.key.match(/^[a-zA-Z]$/)) {
                if (rootState.sound.searchText.length > 0) {
                    // resets the search bar when the user starts typing again and the search field is not in focus
                    dispatch(
                        'sound/onSearchChange',
                        {
                            text: '',
                        },
                        {root: true}
                    )
                }
                focusCallback()
            } else if (event.key === "Escape") {
                sendToIPCRenderer('escPressed')
            }
        })
    },
    selectBoard({commit, state, dispatch}, params) {
        const {boards} = state
        const {id} = params
        const activeBoard = boards.filter((board) => board.id === id)[0]

        if (!activeBoard) return

        commit('selectBoard', activeBoard)
        dispatch('user/updateConnectionStatus', null, {root: true}) // TODO: Mark previous board as disconnected
        dispatch('user/getBoardUsers', null, {root: true})
        dispatch('sound/resetSoundsAndTags', null, {root: true})
        dispatch('sound/getSounds', null, {root: true})
        dispatch('player/unsubscribeToPlayer', null, {root: true})
        dispatch(
            'player/subscribeToPlayer',
            {skipInitial: false},
            {root: true}
        )
        dispatch('board/getApiKeys', null, {root: true})
    },
}

const mutations = {
    unmountBoard(state) {
        state.activeBoard = undefined
    },
    setApiKeys(state, apiKeys) {
        state.apiKeys = apiKeys
    },
    addBoard(state, board) {
        state.boards = [...state.boards, board]
    },
    clearBoards(state) {
        state.boards = []
    },
    changeBoard(state, board) {
        state.boards = state.boards.map((b) => {
            return b.id === board.id ? board : b
        })
        if (board.id === state.activeBoard.id) {
            state.activeBoard = board
        }
    },
    removeBoard(state, {id}) {
        state.boards = state.boards.filter((board) => board.id !== id)
    },
    selectBoard(state, activeBoard) {
        state.activeBoard = activeBoard
        state.lastActiveBoard = activeBoard
    },
    setCreateBoardLoading(state, loading) {
        state.isCreateBoardLoading = loading
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
