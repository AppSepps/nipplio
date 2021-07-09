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
    async createBoard(context, params) {
        const { boardName } = params
        const createBoard = firebase.functions().httpsCallable('createBoard')
        await createBoard({ boardName })
    },
    async inviteUser(context) {
        const { activeBoard } = context.state
        /*let snapshot = await firebase
            .database()
            .ref('/boardInvites/' + activeBoard.id)
            .push(true)
        console.log('Firebase Invite Key: ' + snapshot.key)
        */
        const inviteUserByToken = firebase
            .functions()
            .httpsCallable('createBoard')
        await inviteUserByToken({
            boardId: activeBoard.id,
            token: '-Me8sUTMxS4RahMFtrot',
        })
    },
    async getUser({ commit }) {
        // TODO: Get user from database
        const user = firebase.auth().currentUser
        commit('getUser', { user })
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
                    const name = snapshot.val()['name']
                    const id = snapshot.key
                    const board = {
                        name,
                        id,
                    }
                    commit('addBoard', board)
                })
        })
    },
    async selectBoard({ commit, state }, params) {
        const { id } = params
        const activeBoard = state.boards.filter((board) => board.id === id)[0]
        if (activeBoard) {
            commit('selectBoard', activeBoard)
        }
    },
    async joinBoard(context, params) {
        const { inviteUrl } = params
        console.log(`Trying to join Board with url ${inviteUrl}`)
    },
    async getBoardData({ commit, state }) {
        console.log(commit)
        const { activeBoard } = state
        firebase
            .database()
            .ref('/sounds/' + activeBoard.id)
            .on('value', (snapshot) => {
                snapshot.forEach((sound) => {
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
    async uploadSoundFile({ state }, params) {
        const { file, cbSuccess } = params
        console.log('Trying to upload file ' + JSON.stringify(file))
        const soundSnap = await firebase
            .database()
            .ref('/sounds/' + state.activeBoard.id)
            .push({
                name: 'Soundname',
                type: file.type,
                createdAt: new Date(),
                createdBy: firebase.auth().currentUser.uid,
            })
        await firebase
            .storage()
            .ref('/boards/' + state.activeBoard.id + '/' + soundSnap.key)
            .put(file)
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
        state.boards = [...state.boards, board]
        const ids = state.boards.map((b) => b.id)
        const filtered = state.boards.filter(
            ({ id }, index) => !ids.includes(id, index + 1)
        )
        state.boards = filtered
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
    toggleUserMute(state, { id }) {
        state.mutedUsers = state.mutedUsers.includes(id)
            ? state.mutedUsers.filter((u) => u !== id)
            : [...state.mutedUsers, id]
    },
    signOut(state) {
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
