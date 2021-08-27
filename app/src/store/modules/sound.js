import firebase from 'firebase'

function initialState() {
    return {
        searchText: '',
        selectedTags: [],
        sounds: [],
        favoriteSoundIds: [],
    }
}

const getters = {
    availableTags: function(state) {
        const sounds = state.sounds
        const tagSet = new Set()
        sounds.forEach(sound => {
            if (!sound.tags) return
            const tags = sound.tags.split(',')
            tags.forEach(tag => {
                tagSet.add(tag)
            })
        })

        return Array.from(tagSet).sort((a, b) =>
            a.toLowerCase().localeCompare(b.toLowerCase())
        )
    },
    filteredSounds: function(state) {
        let sounds = state.sounds
            .map(sound =>
                state.favoriteSoundIds.includes(sound.id)
                    ? { ...sound, favorite: true }
                    : { ...sound, favorite: false }
            )
            .sort((a, b) =>
                a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            )
            .sort((a, b) => b.favorite - a.favorite)
            .filter(sound =>
                sound.name
                    .toLowerCase()
                    .includes(state.searchText.toLowerCase())
            )
        // filter for tags
        if (state.selectedTags.length > 0) {
            sounds = sounds.filter(s => {
                if (!s.tags) return false
                let soundHasSelectedFilter = false
                s.tags.split(',').forEach(soundTag => {
                    if (state.selectedTags.includes(soundTag))
                        soundHasSelectedFilter = true
                })
                return soundHasSelectedFilter
            })
        }

        sounds.forEach((sound, index) => {
            sound.index = index
        })
        return sounds
    },
}

const actions = {
    onTagClicked({ commit }, { tagName }) {
        commit('toggleSelectedTag', { tagName })
    },
    getSounds({ commit, rootState }) {
        const { activeBoard } = rootState.board

        if (!activeBoard) return

        commit('clearSounds')
        const soundsRef = firebase.database().ref('/sounds/' + activeBoard.id)

        soundsRef.on('child_added', async snapshot => {
            const soundUrl = await firebase
                .storage()
                .ref(`boards/${activeBoard.id}/${snapshot.key}`)
                .getDownloadURL()
            commit('addSound', {
                id: snapshot.key,
                ...snapshot.val(),
                downloadUrl: soundUrl,
            })
        })

        soundsRef.on('child_changed', async snapshot => {
            const soundUrl = await firebase
                .storage()
                .ref(`boards/${activeBoard.id}/${snapshot.key}`)
                .getDownloadURL()
            commit('changeSound', {
                id: snapshot.key,
                ...snapshot.val(),
                downloadUrl: soundUrl,
            })
        })

        soundsRef.on('child_removed', snapshot => {
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
            .ref(`/sounds/${rootState.board.activeBoard.id}/${sound.id}`)
            .update({
                name: sound.name,
                tags: sound.tags,
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
    async uploadSoundFile({ rootState }, params) {
        const { files, cbSuccess } = params
        for (let file of files) {
            const newSoundKey = await firebase
                .database()
                .ref(`/sounds/${rootState.board.activeBoard.id}`)
                .push()

            await firebase
                .storage()
                .ref(
                    `/boards/${rootState.board.activeBoard.id}/${newSoundKey.key}`
                )
                .put(file)

            await firebase
                .database()
                .ref(
                    `/sounds/${rootState.board.activeBoard.id}/${newSoundKey.key}`
                )
                .set({
                    name: file.name,
                    type: file.type,
                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                    createdBy: firebase.auth().currentUser.uid,
                })
        }

        cbSuccess()
    },
}

const mutations = {
    setSearchText(state, searchText) {
        state.searchText = searchText
    },
    clearSounds(state) {
        state.sounds = []
    },
    addSound(state, sound) {
        state.sounds = [...state.sounds, sound]
    },
    changeSearch(state, { text }) {
        state.searchText = text
    },
    changeSound(state, sound) {
        state.sounds = state.sounds.map(s => {
            return s.id === sound.id ? sound : s
        })
    },
    removeSound(state, { id }) {
        state.sounds = state.sounds.filter(sound => sound.id !== id)
    },
    toggleFavoriteSound(state, { id }) {
        state.favoriteSoundIds = state.favoriteSoundIds.includes(id)
            ? state.favoriteSoundIds.filter(i => i !== id)
            : [...state.favoriteSoundIds, id]
    },
    toggleSelectedTag(state, { tagName }) {
        state.selectedTags = state.selectedTags.includes(tagName)
            ? state.selectedTags.filter(i => i !== tagName)
            : [...state.selectedTags, tagName]
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
