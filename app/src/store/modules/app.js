import firebase from 'firebase'

function initialState() {
    return {
        selfMute: false,
        activeBoard: undefined,
        user: undefined,
        boards: [],
        boardUsers: [],
        mutedUsers: [],
        sounds: [],
    }
}

const getters = {}

// TODO: Better modularization
const actions = {
    async toggleSelfMute({ commit, state }) {
        const { selfMute } = state
        commit('toggleSelfMute', { selfMute: !selfMute })
    },
    async createBoard({ commit }, params) {
        console.log(commit)
        console.log(params)
        const createBoard = firebase.functions().httpsCallable('createBoard')
        await createBoard({ boardName: params.boardName })
    },
    async inviteUser({ commit, state }, params) {
        console.log(commit)
        console.log(state)
        console.log(params)
        let snapshot = await firebase
            .database()
            .ref('/boardInvites/' + state.activeBoard.id)
            .push(true)
        console.log('Firebase Invite Key: ' + snapshot.key)
    },
    async getUser({ commit }) {
        console.log(commit)
        /*const authUser = await Auth.currentAuthenticatedUser()
        const users = await DataStore.query(User, (u) =>
            u.authUsername('eq', authUser.username)
        )
        const user = users[0]
        commit('getUser', { user })*/
    },
    async getBoards({ commit, state }) {
        console.log(state)
        console.log(commit)
        commit('getBoards', [])
        var boardsRef = firebase
            .database()
            .ref('/users/' + firebase.auth().currentUser.uid + '/boards')

        boardsRef.on('child_added', snapshot => {
            firebase
                .database()
                .ref('/boards/' + snapshot.key + '/')
                .on('value', snapshot => {
                    var name = snapshot.val()['name']
                    var id = snapshot.key
                    var obj = {
                        name,
                        id,
                    }
                    commit('addBoard', obj)
                })
        })
        /*const userBoards = await DataStore.query(UserBoard)
        const boards = userBoards
            .filter((ub) => ub.user.id === state.user.id)
            .map((ub) => ub.board)
        commit('getBoards', { boards })*/
    },
    async selectBoard({ commit, state }, params) {
        console.log(commit)
        console.log(params)
        state.boards.forEach(board => {
            if (board.id === params.id) {
                commit('selectBoard', board)
            }
        })
        /*const { id } = params
        const userBoards = await DataStore.query(UserBoard)
        const filteredUserBoards = userBoards.filter((ub) => ub.board.id === id)
        const activeBoard = filteredUserBoards[0].board
        commit('selectBoard', { activeBoard })*/
    },
    async getBoardData({ commit, state }) {
        const { activeBoard } = state
        console.log(activeBoard)
        console.log(commit)
        firebase
            .database()
            .ref('/sounds/' + activeBoard.id)
            .on('value', snapshot => {
                snapshot.forEach(sound => {
                    console.log(sound.val())
                })
            })
        /*const userBoards = await DataStore.query(UserBoard)
        const activeUserBoard = userBoards.filter(
            (ub) => ub.board.id === activeBoard.id
        )
        const boardUsers = activeUserBoard.map((ub) => ub.user)
        const sounds = await DataStore.query(Sound)
        const boardSounds = sounds.filter(
            (sound) => sound.board.id === activeBoard.id
        )
        commit('getBoardData', { boardUsers, boardSounds })*/
    },
    async playSound(action, params) {
        const { id } = params
        console.log('Play sound with id: ' + id)
    },
    async toggleFavoriteSound(action, params) {
        const { id } = params
        action.commit('toggleFavoriteSound', { id })
    },
    async toggleUserMute(action, params) {
        const { id } = params
        action.commit('toggleUserMute', { id })
    },
    async uploadSoundFile(action, params) {
        const { file, cbSuccess } = params
        console.log('Trying to upload file ' + file)
        cbSuccess()
    },
    async signOut({ commit }) {
        await firebase.auth().signOut()
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
    addBoard(state, board) {
        console.log(board)
        state.boards.push(board)
    },
    getBoards(state, boards) {
        state.boards = boards
    },
    selectBoard(state, activeBoard) {
        state.activeBoard = activeBoard
    },
    getBoardData(state, { boardUsers, boardSounds }) {
        state.boardUsers = boardUsers
        state.sounds = boardSounds
    },
    toggleFavoriteSound(state, { id }) {
        // TODO: Better solution if new sounds are loaded or user signs out. Remote favorites?
        state.sounds = state.sounds.map(sound => {
            if (sound.id === id) {
                return {
                    ...sound,
                    favorite: !sound.favorite,
                }
            }
            return sound
        })
    },
    toggleUserMute(state, { id }) {
        state.mutedUsers = state.mutedUsers.includes(id)
            ? state.mutedUsers.filter(u => u !== id)
            : [...state.mutedUsers, id]
    },
    signOut(state) {
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
