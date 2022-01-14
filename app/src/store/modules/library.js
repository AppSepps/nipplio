import firebase from "firebase";

function initialState() {
    return {
        playlists: {},
        playedLocalSound: undefined,
        selectedPlaylist: {
            name: '',
            sounds: []
        }
    }
}

const getters = {
    myPlaylists: (state) => {
        let array = []
        for (const [key, value] of Object.entries(state.playlists)) {
            if (value.owner === firebase.auth().currentUser.uid) {
                array.push({...value, id: key})
            }
        }
        return array
    },
    selectedPlaylist: (state) => {
        return state.selectedPlaylist
    }
}

const actions = {
    async getSoundsForSelectedPlaylist({commit}, playlistId) {
        const soundsSnapshot = await firebase.firestore().collection('sounds').where('playlists', 'array-contains', playlistId).get()
        const soundsArray = []
        soundsSnapshot.forEach((doc) => {
            soundsArray.push({
                ...doc.data(),
                id: doc.id
            })
        })
        commit('addSoundsToSelectedPlaylist', soundsArray)
    },
    async selectedPlaylist({commit}, playlistData) {
        commit('setSelectedPlaylist', playlistData)
    },
    async getSoundsForPlaylists({state, commit}) {
        for (const [key] of Object.entries(state.playlists)) {
            const soundsSnapshot = await firebase.firestore().collection('sounds').where('playlists', 'array-contains', key).get()
            soundsSnapshot.forEach((doc) => {
                const foundSoundsWithSameId = state.playlists[key].sounds.filter((sound) => sound.id === doc.id)
                if (foundSoundsWithSameId.length === 0) {
                    commit('addSoundToPlaylist', {
                        id: key,
                        sound: {
                            ...doc.data(),
                            id: doc.id
                        }
                    })
                }
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
    async getPlaylists({commit}) {
        commit('clearPlaylist')
        const playlistSnapshot = await firebase.firestore().collection('playlists').get()
        playlistSnapshot.forEach((doc) => {
            commit('addPlaylist', {playlist: {...doc.data()}, id: doc.id})
        })
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
        const newSoundKey = await firebase
            .database()
            .ref(`/sounds/${boardId}`)
            .push()

        const downloadUrl = await firebase.storage().ref(`library/${sound.id}`).getDownloadURL()
        const response = await fetch(downloadUrl)
        await firebase.storage().ref(`boards/${boardId}/${newSoundKey.key}`).put(await response.arrayBuffer())

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
    async addLibrarySoundToLibrary({dispatch}, {sound, playlistId}) {
        await firebase.firestore().collection('sounds').doc(sound.id).update({
            playlists: firebase.firestore.FieldValue.arrayUnion(playlistId)
        })
        await dispatch('getPlaylists')
    },
    async deleteSoundFromPlaylist({dispatch}, {sound, playlistId}) {
        await firebase.firestore().collection('sounds').doc(sound.id).update({
            playlists: firebase.firestore.FieldValue.arrayRemove(playlistId)
        })
        await dispatch('getPlaylists')
    },
    async updatePlaylistDetails({dispatch}, playlist) {
        await firebase.firestore().collection('playlists').doc(playlist.id).update({
            name: playlist.name,
            description: playlist.description
        })
        await dispatch('getPlaylists')
    },
    async addBoardSoundToLibrary({rootState}, {sound, playlistId}) {
        //commit('board/updateNotifyText', "Test", {root: true})
        const boardId = rootState.board.activeBoard.id
        const soundDoc = await firebase.firestore().collection('sounds').add({
            isPublic: true,
            name: sound.name,
            type: sound.type,
            createdAt: firebase.firestore.Timestamp.now(),
            createdBy: firebase.auth().currentUser.uid,
            owners: [firebase.auth().currentUser.uid],
            playlists: [playlistId],
            views: 0
        })

        const downloadUrl = await firebase.storage().ref(`boards/${boardId}/${sound.id}`).getDownloadURL()
        const response = await fetch(downloadUrl)
        await firebase.storage().ref(`library/${soundDoc.id}`).put(await response.arrayBuffer())

        //commit('board/updateNotifyText', "Successfull", {root: true})
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
        state.playlists[data.id].sounds.push(data.sound)
    },
    addSoundsToSelectedPlaylist(state, soundsArray) {
        state.selectedPlaylist.sounds = soundsArray
    },
    setSelectedPlaylist(state, data) {
        state.selectedPlaylist = {
            ...data
        }
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
