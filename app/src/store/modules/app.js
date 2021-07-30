import firebase from 'firebase'
import { v4 as uuidv4 } from 'uuid'

function initialState() {
    return {
        selfMute: false,
        user: undefined,
        boardUsers: [],
        mutedUsers: [],
        sounds: [],
        playedSound: undefined,
        searchText: '',
        recentlyPlayed: [],
        volume: 50,
    }
}

const getters = {
    filteredSounds: (state) =>
        state.sounds
            .sort((a, b) =>
                a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            )
            .filter((sound) =>
                sound.name
                    .toLowerCase()
                    .includes(state.searchText.toLowerCase())
            ),
    connectedUsers: (state) =>
        state.boardUsers.filter((boardUser) => boardUser.connected),
    disconnectedUsers: (state) =>
        state.boardUsers.filter((boardUser) => !boardUser.connected),
}

// TODO: Better modularization
const actions = {
    async toggleSelfMute({ commit, state, rootState }) {
        const { selfMute } = state
        const { activeBoard } = rootState.board

        if (activeBoard) {
            await firebase
                .database()
                .ref(
                    `/boardUsers/${activeBoard.id}/${
                        firebase.auth().currentUser.uid
                    }`
                )
                .update({
                    muted: !selfMute,
                })
        }

        commit('toggleSelfMute', { selfMute: !selfMute })

        try {
            window.ipcRenderer.send(
                !selfMute ? 'setIconToMute' : 'setIconToUnmute'
            )
        } catch (error) {
            // Is Web instance
        }
    },
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
    async updateConnectionStatus({ state, rootState }) {
        const { selfMute } = state
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
    async getSounds({ commit, rootState }) {
        const { activeBoard } = rootState.board

        if (!activeBoard) return

        const soundsRef = firebase.database().ref('/sounds/' + activeBoard.id)

        soundsRef.on('child_added', (snapshot) => {
            commit('addSound', {
                id: snapshot.key,
                ...snapshot.val(),
            })
        })

        soundsRef.on('child_changed', (snapshot) => {
            commit('changeSound', {
                id: snapshot.key,
                ...snapshot.val(),
            })
        })

        soundsRef.on('child_removed', (snapshot) => {
            commit('removeSound', {
                id: snapshot.key,
            })
        })
    },
    async removeSound(context, params) {
        const { activeBoard } = context.rootState.board
        const { soundId } = params

        const soundRef = firebase
            .database()
            .ref(`/sounds/${activeBoard.id}/${soundId}`)
        await soundRef.remove()
        await firebase
            .storage()
            .ref(`/boards/${activeBoard.id}/${soundId}`)
            .delete()
    },
    async unsubscribeToPlay({ rootState }) {
        const { activeBoard } = rootState.board

        if (!activeBoard) return

        firebase
            .database()
            .ref('/play/' + activeBoard.id)
            .off()
    },
    async subscribeToPlay({ state, rootState, commit }, params) {
        const { user } = state
        const { activeBoard } = rootState.board
        let skipInitial =
            params && params.skipInitial ? params.skipInitial : true

        if (!activeBoard) return

        const playRef = firebase.database().ref('/play/' + activeBoard.id)

        playRef.on('value', async (snapshot) => {
            if (skipInitial) {
                skipInitial = false
                return
            }
            const play = snapshot.val()
            const soundUrl = await firebase
                .storage()
                .ref(`boards/${activeBoard.id}/${play.soundId}`)
                .getDownloadURL()
            const skip = play.mutedUsers && play.mutedUsers.includes(user.uid)
            const playedSound = {
                ...play,
                skip,
                soundUrl,
                timestamp: new Date(),
            }
            commit('updatePlayedSound', { playedSound })
            commit('addRecentlyPlayed', {
                soundId: play.soundId,
                playedBy: play.playedBy,
            })
        })
    },
    async playRandomSound({ state, dispatch }) {
        const { sounds } = state
        const randomSound = sounds[Math.floor(Math.random() * sounds.length)]
        dispatch('triggerPlaySound', { id: randomSound.id, random: true }) // TODO: Maybe we should extract business logic to utils class and only handle vuex behaviour here
    },
    async triggerPlaySound({ state, rootState }, params) {
        const { user, mutedUsers } = state
        const { activeBoard } = rootState.board
        const { id, random = false } = params
        await firebase
            .database()
            .ref('/play/' + activeBoard.id)
            .set({
                uuid: uuidv4(),
                soundId: id,
                playedBy: user.uid,
                mutedUsers,
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
    async uploadSoundFile({ rootState }, params) {
        const { files, cbSuccess } = params
        for (let file of files) {
            const soundSnap = await firebase
                .database()
                .ref('/sounds/' + rootState.activeBoard.id)
                .push({
                    name: file.name,
                    type: file.type,
                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                    createdBy: firebase.auth().currentUser.uid,
                })
            await firebase
                .storage()
                .ref(
                    '/boards/' + rootState.activeBoard.id + '/' + soundSnap.key
                )
                .put(file)
        }

        cbSuccess()
    },
    async onSearchChange({ commit }, params) {
        const { text } = params
        commit('changeSearch', { text })
    },
    async onSoundEdit({ rootState }, sound) {
        await firebase
            .database()
            .ref(`/sounds/${rootState.activeBoard.id}/${sound.id}`)
            .update({
                name: sound.name,
            })
    },
    onVolumeChange({ commit }, params) {
        const { volume } = params
        commit('changeVolume', { volume })
    },
}

const mutations = {
    toggleSelfMute(state, { selfMute }) {
        state.selfMute = selfMute
    },
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
    addSound(state, sound) {
        state.sounds = [...state.sounds, sound]
    },
    changeSound(state, sound) {
        state.sounds = state.sounds.map((s) => {
            return s.id === sound.id ? sound : s
        })
    },
    removeSound(state, { id }) {
        state.sounds = state.sounds.filter((sound) => sound.id !== id)
    },
    updatePlayedSound(state, { playedSound }) {
        state.playedSound = playedSound
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
    changeSearch(state, { text }) {
        state.searchText = text
    },
    changeVolume(state, { volume }) {
        state.volume = volume
    },
    addRecentlyPlayed(state, { soundId, playedBy }) {
        const sound = state.sounds.filter((sound) => sound.id === soundId)[0]
        const user = state.boardUsers.filter((user) => user.id === playedBy)[0]
        const recentlyPlayedSound = {
            soundId,
            name: sound.name,
            user: user,
            timestamp: new Date(),
        }
        state.recentlyPlayed = [...state.recentlyPlayed, recentlyPlayedSound]
        if (state.recentlyPlayed.length > 5) {
            state.recentlyPlayed.shift()
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
