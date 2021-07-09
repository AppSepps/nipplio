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
        let snapshot = await firebase
            .database()
            .ref('/boardInvites/' + activeBoard.id)
            .push(true)
        let url =
            window.location.origin +
            window.location.pathname +
            '?boardId=' +
            activeBoard.id +
            '&token=' +
            snapshot.key
        console.log('Firebase Invite Key: ' + url)
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
    async selectBoard({ commit, state, dispatch }, params) {
        const { id } = params
        const activeBoard = state.boards.filter((board) => board.id === id)[0]
        if (activeBoard) {
            commit('selectBoard', activeBoard)
            dispatch('getSounds')
            dispatch('subscribeToPlay')
        }
    },
    async joinBoard({ dispatch }, params) {
        const { inviteUrl } = params
        console.log(`Trying to join Board with url ${inviteUrl}`)
        const url = new URL(inviteUrl)
        const boardId = url.searchParams.get('boardId')
        const token = url.searchParams.get('token')

        const inviteUserByToken = firebase
            .functions()
            .httpsCallable('addUserByInvite')
        try {
            let response = await inviteUserByToken({
                boardId: boardId,
                token: token,
            })
            console.log(response) // TODO: Check response result
            dispatch('selectBoard', { boardId })
        } catch (error) {
            console.log(error)
        }
    },
    async getSounds({ commit, state }) {
        const { activeBoard } = state
        const soundsRef = firebase.database().ref('/sounds/' + activeBoard.id)

        soundsRef.on('child_added', (snapshot) => {
            commit('addSound', {
                id: snapshot.key,
                ...snapshot.val(),
            })
        })
    },
    async unsubscribeToPlay({ state }) {
        const { activeBoard } = state
        if (activeBoard) {
            firebase
                .database()
                .ref('/play/' + activeBoard.id)
                .off()
        }
    },
    async subscribeToPlay({ state, dispatch }, params) {
        const { activeBoard } = state
        const { cbSuccess } = params
        dispatch('unsubscribeToPlay')
        if (activeBoard) {
            const playRef = firebase.database().ref('/play/' + activeBoard.id)

            // TODO: Verhindern, dass der Sound beim Start abgespielt wird
            playRef.on('value', async (snapshot) => {
                const play = snapshot.val()
                const soundUrl = await firebase
                    .storage()
                    .ref(`boards/${activeBoard.id}/${play.soundId}`)
                    .getDownloadURL()
                cbSuccess(soundUrl) // TODO: Callback richtig handhaben an allen Stellen. Sound am besten in der Sound Komponente abspielen oder extra Komponente
            })
        }
    },
    async triggerPlaySound({ state }, params) {
        const { activeBoard, user } = state
        const { id } = params
        // const timestamp = firebase.database.ServerValue.TIMESTAMP // Der kommt wieder rein. wenns geht
        await firebase
            .database()
            .ref('/play/' + activeBoard.id)
            .set({
                timestamp: new Date(),
                soundId: id,
                playedBy: user.uid,
                mutedUsers: {},
            })
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
        const soundSnap = await firebase
            .database()
            .ref('/sounds/' + state.activeBoard.id)
            .push({
                name: file.name,
                type: file.type,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                createdBy: firebase.auth().currentUser.uid,
            })
        await firebase
            .storage()
            .ref('/boards/' + state.activeBoard.id + '/' + soundSnap.key)
            .put(file)
        cbSuccess()
    },
    async signOut({ commit, dispatch }) {
        await firebase.auth().signOut()
        dispatch('unsubscribeToPlay')
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
    addSound(state, sound) {
        state.sounds = [...state.sounds, sound]
        const ids = state.sounds.map((s) => s.id)
        const filtered = state.sounds.filter(
            ({ id }, index) => !ids.includes(id, index + 1)
        )
        state.sounds = filtered
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
