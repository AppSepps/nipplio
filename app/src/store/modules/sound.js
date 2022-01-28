import {getDownloadURL, getStorage, ref, deleteObject, uploadBytes} from "firebase/storage";
import {
    getDatabase,
    serverTimestamp,
    ref as databaseRef,
    off,
    get,
    onChildChanged,
    onChildRemoved,
    query,
    limitToLast,
    orderByChild,
    startAt, onChildAdded, update, remove, push, set
} from "firebase/database";
import {getAnalytics, logEvent} from "firebase/analytics";
import {addDoc, collection, getFirestore, Timestamp} from "firebase/firestore";
import {getAuth} from "firebase/auth";

function initialState() {
    return {
        areSoundsLoading: false,
        favoriteSoundIds: [],
        searchText: '',
        selectedTags: [],
        sounds: [],
    }
}

const getters = {
    availableTags: function (state) {
        const sounds = state.sounds
        const tagSet = new Set()
        sounds.forEach((sound) => {
            if (!sound.tags) return
            const tags = sound.tags.split(',')
            tags.forEach((tag) => {
                tagSet.add(tag)
            })
        })

        return Array.from(tagSet).sort((a, b) =>
            a.toLowerCase().localeCompare(b.toLowerCase())
        )
    },
    filteredSounds: function (state) {
        let sounds = state.sounds
            .map((sound) =>
                state.favoriteSoundIds.includes(sound.id)
                    ? {...sound, favorite: true}
                    : {...sound, favorite: false}
            )
            .sort((a, b) =>
                a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            )
            .sort((a, b) => b.favorite - a.favorite)
            .filter((sound) =>
                sound.name
                    .toLowerCase()
                    .includes(state.searchText.toLowerCase())
            )
        // filter for tags
        if (state.selectedTags.length > 0) {
            sounds = sounds.filter((s) => {
                if (!s.tags) return false
                let soundHasSelectedFilter = false
                s.tags.split(',').forEach((soundTag) => {
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
    async generateDownloadUrl({rootState}, {id, cb}) {
        const soundUrl = await getDownloadURL(ref(getStorage(), `boards/${rootState.board.activeBoard.id}/${id}`))
        cb(soundUrl)
    },
    getSounds({commit, rootState}) {
        const {activeBoard} = rootState.board

        if (!activeBoard) return

        commit('clearSounds')
        const soundsRef = databaseRef(getDatabase(), '/sounds/' + activeBoard.id)
        off(soundsRef)

        commit('setAreSoundsLoading', true)
        get(soundsRef).then(async (snapshot) => {
            const sounds = []
            snapshot.forEach((s) => {
                sounds.push({id: s.key, ...s.val()})
            })

            commit('addSounds', sounds)
            commit('setAreSoundsLoading', false)

            onChildAdded(query(soundsRef, limitToLast(1), orderByChild('createdAt'), startAt(Date.now())), async (snapshot) => {
                commit('addSound', {
                    id: snapshot.key,
                    ...snapshot.val(),
                })
            })

            onChildChanged(soundsRef, async (snapshot) => {
                commit('changeSound', {
                    id: snapshot.key,
                    ...snapshot.val(),
                })
            })

            onChildRemoved(soundsRef, (snapshot) => {
                commit('removeSound', {
                    id: snapshot.key,
                })
            })
        })
    },
    onSearchChange({commit}, params) {
        const {text} = params
        commit('changeSearch', {text})
    },
    async onSoundEdit({rootState}, sound) {
        await update(databaseRef(getDatabase(), `/sounds/${rootState.board.activeBoard.id}/${sound.id}`), {
            name: sound.name,
            tags: sound.tags,
        })
        await logEvent(getAnalytics(), 'sound_edit', sound)
    },
    onTagClicked({commit}, {tagName}) {
        commit('toggleSelectedTag', {tagName})
    },
    async removeSound(context, params) {
        const {activeBoard} = context.rootState.board
        const {soundId} = params

        const soundRef = databaseRef(getDatabase(), `/sounds/${activeBoard.id}/${soundId}`)
        await remove(soundRef)

        await deleteObject(ref(getStorage(), `/boards/${activeBoard.id}/${soundId}`))
        await logEvent(getAnalytics(), 'sound_delete', {soundId})
    },
    resetSoundsAndTags({commit}) {
        commit('resetSounds')
        commit('resetTags')
    },
    async toggleFavoriteSound({commit, rootState}, params) {
        const {id} = params
        commit('toggleFavoriteSound', {id})
        logEvent(getAnalytics(), rootState.sound.favoriteSoundIds.includes(id) ? 'add_favorite' : 'remove_favorite', {
            favoriteId: id
        })
    },
    async uploadPublicSound(context, params) {
        const {files, cbSuccess, playlistId} = params
        for (let file of files) {
            const soundDoc = await addDoc(collection(getFirestore(), 'sounds'), {
                isPublic: true,
                name: file.name,
                type: file.type,
                createdAt: Timestamp.now(),
                createdBy: getAuth().currentUser.uid,
                owners: [getAuth().currentUser.uid],
                playlists: [playlistId],
                views: 0
            })
            await uploadBytes(ref(getStorage(), `/library/${soundDoc.id}`), file)
        }
        cbSuccess()
    },
    async uploadSoundFile({rootState}, params) {
        const {files, cbSuccess} = params
        for (let file of files) {
            const newSoundKey = await push(databaseRef(getDatabase(), `/sounds/${rootState.board.activeBoard.id}`))

            await uploadBytes(ref(getStorage(), `/boards/${rootState.board.activeBoard.id}/${newSoundKey.key}`), file)

            await set(databaseRef(getDatabase(), `/sounds/${rootState.board.activeBoard.id}/${newSoundKey.key}`), {
                name: file.name,
                type: file.type,
                createdAt: serverTimestamp(),
                createdBy: getAuth().currentUser.uid,
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
    addSounds(state, sounds) {
        state.sounds = sounds
    },
    changeSearch(state, {text}) {
        state.searchText = text
    },
    changeSound(state, sound) {
        state.sounds = state.sounds.map((s) => {
            return s.id === sound.id ? sound : s
        })
    },
    removeSound(state, {id}) {
        state.sounds = state.sounds.filter((sound) => sound.id !== id)
    },
    resetSounds(state) {
        state.sounds = []
    },
    resetTags(state) {
        state.selectedTags = []
    },
    setAreSoundsLoading(state, loading) {
        state.areSoundsLoading = loading
    },
    toggleFavoriteSound(state, {id}) {
        state.favoriteSoundIds = state.favoriteSoundIds.includes(id)
            ? state.favoriteSoundIds.filter((i) => i !== id)
            : [...state.favoriteSoundIds, id]
    },
    toggleSelectedTag(state, {tagName}) {
        state.selectedTags = state.selectedTags.includes(tagName)
            ? state.selectedTags.filter((i) => i !== tagName)
            : [...state.selectedTags, tagName]
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
