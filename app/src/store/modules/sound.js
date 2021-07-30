import firebase from 'firebase'
import { v4 as uuidv4 } from 'uuid'

function initialState() {
    return {
        playedSound: undefined,
        recentlyPlayed: [],
        selfMute: false,
        searchText: '',
        sounds: [],
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
}

// Maybe extract extra 'player' module
const actions = {
    getSounds({ commit, rootState }) {
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
    onSearchChange({ commit }, params) {
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
    async playRandomSound({ state, dispatch }) {
        const { sounds } = state
        const randomSound = sounds[Math.floor(Math.random() * sounds.length)]
        dispatch('triggerPlaySound', { id: randomSound.id, random: true }) // TODO: Maybe we should extract business logic to utils class and only handle vuex behaviour here
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
    async toggleFavoriteSound(action, params) {
        const { id } = params
        action.commit('toggleFavoriteSound', { id })
    },
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
    unsubscribeToPlay({ rootState }) {
        const { activeBoard } = rootState.board

        if (!activeBoard) return

        firebase
            .database()
            .ref('/play/' + activeBoard.id)
            .off()
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
}

const mutations = {
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
    addSound(state, sound) {
        state.sounds = [...state.sounds, sound]
    },
    changeSearch(state, { text }) {
        state.searchText = text
    },
    changeSound(state, sound) {
        state.sounds = state.sounds.map((s) => {
            return s.id === sound.id ? sound : s
        })
    },
    changeVolume(state, { volume }) {
        state.volume = volume
    },
    removeSound(state, { id }) {
        state.sounds = state.sounds.filter((sound) => sound.id !== id)
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
    toggleSelfMute(state, { selfMute }) {
        state.selfMute = selfMute
    },
    updatePlayedSound(state, { playedSound }) {
        state.playedSound = playedSound
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
