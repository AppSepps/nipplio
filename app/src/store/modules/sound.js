import firebase from 'firebase'

function initialState() {
    return {
        selfMute: false,
        searchText: '',
        sounds: [],
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
    async uploadSoundFile({ rootState }, params) {
        const { files, cbSuccess } = params
        for (let file of files) {
            const soundSnap = await firebase
                .database()
                .ref('/sounds/' + rootState.board.activeBoard.id)
                .push({
                    name: file.name,
                    type: file.type,
                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                    createdBy: firebase.auth().currentUser.uid,
                })
            await firebase
                .storage()
                .ref(
                    '/boards/' +
                        rootState.board.activeBoard.id +
                        '/' +
                        soundSnap.key
                )
                .put(file)
        }

        cbSuccess()
    },
}

const mutations = {
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
