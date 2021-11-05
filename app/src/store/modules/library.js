import firebase from "firebase";

function initialState() {
    return {
        playlists: {}
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
    }
    ,
    addPlaylistClicked() {
        firebase.firestore().collection('playlists').add({
            name: 'Neue Playlist',
            owner: firebase.auth().currentUser.uid,
            ownerName: firebase.auth().currentUser.displayName,
            likes: 0,
        })
    }
    ,
    async getPlaylists({commit, dispatch}) {
        const playlistSnapshot = await firebase.firestore().collection('playlists').get()
        playlistSnapshot.forEach((doc) => {
            commit('addPlaylist', {playlist: {...doc.data(), sounds: []}, id: doc.id})
        })
        await dispatch('getSoundsForPlaylists')
    }
}

const mutations = {
    setThemeId(state, id) {
        state.currentThemeId = id
    },
    addPlaylist(state, {id, playlist}) {
        state.playlists[id] = playlist
    },
    addSoundToPlaylist(state, data) {
        console.log(data)
        state.playlists[data.id].sounds.push(data.sound)
    }
}

export default {
    namespaced: true,
    state: initialState,
    getters,
    actions,
    mutations,
}
