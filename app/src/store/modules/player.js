import firebase from 'firebase'
import { v4 as uuidv4 } from 'uuid'

function initialState() {
    return {
        playedSound: undefined,
        recentlyPlayed: [],
        volume: 50,
    }
}

const getters = {}

const actions = {
    onVolumeChange({ commit }, params) {
        const { volume } = params
        commit('changeVolume', { volume })
    },
    playRandomSound({ rootState, dispatch }) {
        const { sounds } = rootState.sound
        const randomSound = sounds[Math.floor(Math.random() * sounds.length)]
        dispatch('playRemoteSound', { id: randomSound.id, random: true })
    },
    subscribeToPlayer({ rootState, rootGetters, commit }, params) {
        const { user, boardUsers } = rootState.user
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

            const skipByRemote =
                play.mutedUsers && play.mutedUsers.includes(user.uid)
            const skip = skipByRemote || rootGetters['user/selfMute']
            if (skip) return;

            const playedSound = {
                ...play,
                skip,
                soundUrl,
                timestamp: new Date(),
            }
            commit('updatePlayedSound', { playedSound })

            const sound = rootState.sound.sounds.filter(
                (sound) => sound.id === play.soundId
            )[0]
            const playedByUser = boardUsers.filter(
                (user) => user.id === play.playedBy
            )[0]
            commit('addRecentlyPlayed', {
                sound: sound,
                user: playedByUser,
            })
        })
    },
    async playRemoteSound({ rootState }, params) {
        const { user, mutedUsers } = rootState.user
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
    unsubscribeToPlayer({ rootState }) {
        const { activeBoard } = rootState.board

        if (!activeBoard) return

        firebase
            .database()
            .ref('/play/' + activeBoard.id)
            .off()
    },
}

const mutations = {
    addRecentlyPlayed(state, { sound, user }) {
        const recentlyPlayedSound = {
            soundId: sound.id,
            name: sound.name,
            user,
            timestamp: new Date(),
        }
        state.recentlyPlayed = [...state.recentlyPlayed, recentlyPlayedSound]
        if (state.recentlyPlayed.length > 5) {
            state.recentlyPlayed.shift()
        }
    },
    changeVolume(state, { volume }) {
        state.volume = volume
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
