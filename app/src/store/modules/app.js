import firebase from 'firebase'
import { v4 as uuidv4 } from 'uuid'

function initialState() {
    return {
        selfMute: false,
        activeBoard: undefined,
        user: undefined,
        boards: [],
        boardUsers: [],
        mutedUsers: [],
        sounds: [],
        playedSound: undefined,
    }
}

const getters = {}

// TODO: Better modularization
const actions = {
    async toggleSelfMute({ commit, state }) {
        const { selfMute } = state
        commit('toggleSelfMute', { selfMute: !selfMute })
        require('electron').ipcRenderer.send(
            !selfMute ? 'setIconToMute' : 'setIconToUnmute'
        )
    },
    async createBoard(context, params) {
        const { boardName } = params
        const createBoard = firebase.functions().httpsCallable('createBoard')
        await createBoard({ boardName })
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
    async getUser({ commit }) {
        // TODO: Get user from database
        const user = firebase.auth().currentUser
        commit('getUser', { user })
    },
    async getBoards({ commit }) {
        const boardsRef = firebase
            .database()
            .ref('/users/' + firebase.auth().currentUser.uid + '/boards')

        boardsRef.on('child_added', snapshot => {
            firebase
                .database()
                .ref('/boards/' + snapshot.key + '/')
                .on('value', snapshot => {
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
    async getBoardUsers({ state, commit }) {
        const { activeBoard } = state
        if (!activeBoard) {
            return
        }
        commit('getBoardUsers', { users: [] })
    },
    async selectBoard({ commit, state, dispatch }, params) {
        const { id } = params
        const activeBoard = state.boards.filter(board => board.id === id)[0]
        if (activeBoard) {
            commit('selectBoard', activeBoard)
            dispatch('getBoardUsers')
            dispatch('getSounds')
            dispatch('unsubscribeToPlay')
            dispatch('subscribeToPlay', { skipInitial: false })
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
        if (!activeBoard) {
            return
        }
        const soundsRef = firebase.database().ref('/sounds/' + activeBoard.id)

        soundsRef.on('child_added', snapshot => {
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
    async subscribeToPlay({ state, commit }, params) {
        let skipInitial =
            params && params.skipInitial ? params.skipInitial : true
        const { activeBoard } = state
        if (activeBoard) {
            const playRef = firebase.database().ref('/play/' + activeBoard.id)

            playRef.on('value', async snapshot => {
                if (skipInitial) {
                    skipInitial = false
                    return
                }
                const play = snapshot.val()
                const soundUrl = await firebase
                    .storage()
                    .ref(`boards/${activeBoard.id}/${play.soundId}`)
                    .getDownloadURL()
                const playedSound = { ...play, soundUrl, timestamp: new Date() }
                commit('updatePlayedSound', { playedSound })
            })
        }
    },
    async playRandomSound({ state, dispatch }) {
        const { sounds } = state
        const randomSound = sounds[Math.floor(Math.random() * sounds.length)]
        dispatch('triggerPlaySound', { id: randomSound.id, random: true }) // TODO: Maybe we should extract business logic to utils class and only handle vuex behaviour here
    },
    async triggerPlaySound({ state }, params) {
        const { activeBoard, user } = state
        const { id, random = false } = params
        await firebase
            .database()
            .ref('/play/' + activeBoard.id)
            .set({
                uuid: uuidv4(),
                soundId: id,
                playedBy: user.uid,
                mutedUsers: {},
                random,
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
        const { files, cbSuccess } = params
        for (let file of files) {
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
        }

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
    getBoardUsers(state, { users }) {
        state.boardUsers = users
    },
    addBoard(state, board) {
        state.boards = [...state.boards, board]
        const ids = state.boards.map(b => b.id)
        const filtered = state.boards.filter(
            ({ id }, index) => !ids.includes(id, index + 1)
        )
        state.boards = filtered
    },
    addSound(state, sound) {
        state.sounds = [...state.sounds, sound]
        const ids = state.sounds.map(s => s.id)
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
    updatePlayedSound(state, { playedSound }) {
        state.playedSound = playedSound
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
