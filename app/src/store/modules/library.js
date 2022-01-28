import {getAuth} from "firebase/auth";
import {getFirestore, arrayRemove, arrayUnion, Timestamp, getDocs, query, collection, where, addDoc, deleteDoc, doc, updateDoc} from "firebase/firestore";
import {getDatabase, push, serverTimestamp, ref as databaseRef, set} from "firebase/database";
import {getDownloadURL, getStorage, ref, deleteObject, uploadBytes} from "firebase/storage";

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
            if (value.owner === getAuth().currentUser.uid) {
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
        const soundsSnapshot = await getDocs(query(collection(getFirestore(), "sounds"), where('playlists', 'array-contains', playlistId)))
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
            const soundsSnapshot = await getDocs(query(collection(getFirestore(), "sounds"), where('playlists', 'array-contains', key)))
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
        await addDoc(collection(getFirestore(), 'playlists'),{
            name: 'Neue Playlist',
            owner: getAuth().currentUser.uid,
            ownerName: getAuth().currentUser.displayName,
            likes: 0,
            createdAt: serverTimestamp()
        })
        await dispatch('getPlaylists')
    },
    async getPlaylists({commit, dispatch}) {
        commit('clearPlaylist')
        const playlistSnapshot = await getDocs(query(collection(getFirestore(), 'playlists')))
        playlistSnapshot.forEach((doc) => {
            commit('addPlaylist', {playlist: {...doc.data()}, id: doc.id})
            dispatch('addThumbnailToPlaylist', doc.id)
        })
    },
    async addThumbnailToPlaylist({commit}, playlistId) {
        const thumbnailURL = await getDownloadURL(ref(getStorage(), `/libraryThumbnails/${playlistId}`))
        commit('addThumbnailURLToPlaylist', { playlistId, thumbnailURL})
    },
    async playLocalSound({commit}, sound) {
        const soundUrl = await getDownloadURL(ref(getStorage(), `library/${sound.id}`))
        commit('setPlayedLocalSound', {...sound, soundUrl})
    },
    async removePlaylistWithId({dispatch}, id) {
        const soundsSnapshot = await getDocs(query(collection(getFirestore(), 'sounds'), where('playlists', 'array-contains', id)))
        let tempCollection = [];
        soundsSnapshot.forEach(collection => {
            tempCollection.push(collection);
        });
        for await(let document of tempCollection) {
            if (document.data().playlists.length === 1) {
                // this sound has only this playlist set -> delete the sound from database and storage
                await deleteObject(ref(getStorage(), `library/${document.id}`))
                await deleteDoc(doc(getFirestore(), `sounds/${document.id}`))
            } else {
                // this sound has multiple playlists stored -> remove only the deleted one
                await updateDoc(document.ref, {
                    playlists: arrayRemove(id)
                })
            }
        }
        await deleteDoc(doc(getFirestore(), `playlists/${id}`))
        await dispatch('getPlaylists')
    },
    async addLibrarySoundToBoard(context, {sound, boardId}) {
        const newSoundKey = await push(databaseRef(getDatabase()), `/sounds/${boardId}`)

        const downloadUrl = await getDownloadURL(ref(getStorage(), `library/${sound.id}`))
        const response = await fetch(downloadUrl)
        await uploadBytes(ref(getStorage(), `boards/${boardId}/${newSoundKey.key}`), await response.arrayBuffer())

        await set(databaseRef(getDatabase(), `/sounds/${boardId}/${newSoundKey.key}`), {
            name: sound.name,
            type: sound.type,
            createdAt: serverTimestamp(),
            createdBy: getAuth().currentUser.uid,
        })
    },
    async addLibrarySoundToLibrary({dispatch}, {sound, playlistId}) {
        await updateDoc(doc(getFirestore(), 'sounds', sound.id), {
            playlists: arrayUnion(playlistId)
        })
        await dispatch('getPlaylists')
    },
    async deleteSoundFromPlaylist({dispatch}, {sound, playlistId}) {
        await updateDoc(doc(getFirestore(), 'sounds', sound.id), {
            playlists: arrayRemove(playlistId)
        })
        await dispatch('getPlaylists')
    },
    async updatePlaylistDetails({dispatch}, playlist) {
        await updateDoc(doc(getFirestore(), 'playlists', playlist.id), {
            name: playlist.name,
            description: playlist.description
        })
        await dispatch('getPlaylists')
    },
    async addBoardSoundToLibrary({rootState}, {sound, playlistId}) {
        //commit('board/updateNotifyText', "Test", {root: true})
        const boardId = rootState.board.activeBoard.id
        const soundDoc = await addDoc(doc(getFirestore(), 'sounds'), {
            isPublic: true,
            name: sound.name,
            type: sound.type,
            createdAt: Timestamp.now(),
            createdBy: getAuth().currentUser.uid,
            owners: [getAuth().currentUser.uid],
            playlists: [playlistId],
            views: 0
        })

        const downloadUrl = await getDownloadURL(ref(getStorage(), `boards/${boardId}/${sound.id}`))
        const response = await fetch(downloadUrl)
        await uploadBytes(ref(getStorage(), `library/${soundDoc.id}`), await response.arrayBuffer())

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
    },
    addThumbnailURLToPlaylist(state, {playlistId, thumbnailURL}) {
        state.playlists[playlistId].thumbnailURL = thumbnailURL
    }
}

export default {
    namespaced: true,
    state: initialState,
    getters,
    actions,
    mutations,
}
