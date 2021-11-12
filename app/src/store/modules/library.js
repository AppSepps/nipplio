import firebase from "firebase";

function initialState() {
    return {
        playlists: {},
        playedLocalSound: undefined
    }
}

const getters = {}

const actions = {
    async getSoundsForPlaylists({state, commit}) {
        for (const [key] of Object.entries(state.playlists)) {
            const soundsSnapshot = await firebase.firestore().collection('sounds').where('playlists', 'array-contains', key).get()
            soundsSnapshot.forEach((doc) => {
                commit('addSoundToPlaylist', {
                    id: key,
                    sound: {
                        ...doc.data(),
                        id: doc.id
                    }
                })
            })
        }
    },
    async addPlaylistClicked({dispatch}) {
        await firebase.firestore().collection('playlists').add({
            name: 'Neue Playlist',
            owner: firebase.auth().currentUser.uid,
            ownerName: firebase.auth().currentUser.displayName,
            likes: 0,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        })
        await dispatch('getPlaylists')
    },
    async getPlaylists({commit, dispatch}) {
        commit('clearPlaylist')
        const playlistSnapshot = await firebase.firestore().collection('playlists').get()
        playlistSnapshot.forEach((doc) => {
            commit('addPlaylist', {playlist: {...doc.data(), sounds: []}, id: doc.id})
        })
        await dispatch('getSoundsForPlaylists')
    },
    async playLocalSound({commit}, sound) {
        const soundUrl = await firebase
            .storage()
            .ref(`library/${sound.id}`)
            .getDownloadURL()
        commit('setPlayedLocalSound', {...sound, soundUrl})
    },
    async removePlaylistWithId({dispatch}, id) {
        await firebase.firestore().collection('sounds')
        const soundsSnapshot = await firebase.firestore().collection('sounds').where('playlists', 'array-contains', id).get()
        var tempCollection = [];
        soundsSnapshot.forEach(collection => {
            tempCollection.push(collection);
        });
        for await(let doc of tempCollection) {
            if (doc.data().playlists.length === 1) {
                // this sound has only this playlist set -> delete the sound from database and storage
                await firebase.storage().ref(`library/${doc.id}`).delete()
                await firebase.firestore().collection('sounds').doc(doc.id).delete()
            } else {
                // this sound has multiple playlists stored -> remove only the deleted one
                await doc.ref.update({
                    playlists: firebase.firestore.FieldValue.arrayRemove(id)
                })
            }
        }
        await firebase.firestore().collection('playlists').doc(id).delete()
        await dispatch('getPlaylists')
    },
    async addLibrarySoundToBoard(context, {sound, boardId}) {
        console.log(sound)
        console.log(boardId)
        const newSoundKey = await firebase
            .database()
            .ref(`/sounds/${boardId}`)
            .push()

        console.log("before oncall")
        const copySoundFromLibrary = firebase.functions().httpsCallable('copySoundFromLibrary')
        console.log("after oncall")
        const result = await copySoundFromLibrary({
            'librarySoundId': sound.id,
            'boardSoundId': newSoundKey.key,
            'boardId': boardId
        })
        console.log("result", result)

        await firebase
            .database()
            .ref(
                `/sounds/${boardId}/${newSoundKey.key}`
            )
            .set({
                name: sound.name,
                type: sound.type,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                createdBy: firebase.auth().currentUser.uid,
            })
    },
    async updatePlaylistDetails({dispatch}, playlist) {
        console.log(playlist)
        await firebase.firestore().collection('playlists').doc(playlist.id).update({
            name: playlist.name,
            description: playlist.description
        })
        await dispatch('getPlaylists')
    }
}

const mutations = {
    setThemeId(state, id) {
        state.currentThemeId = id
    },
    clearPlaylist(state) {
        state.playlists = {}
    },
    addPlaylist(state, {id, playlist}) {
        state.playlists[id] = playlist
    },
    addSoundToPlaylist(state, data) {
        console.log(data)
        state.playlists[data.id].sounds.push(data.sound)
    },
    setPlayedLocalSound(state, sound) {
        state.playedLocalSound = sound
    }
}

export default {
    namespaced: true,
    state: initialState,
    getters,
    actions,
    mutations,
}
