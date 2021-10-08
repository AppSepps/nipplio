import firebase from 'firebase'
import { v4 as uuidv4 } from 'uuid'

function initialState() {
    return {
        playedSound: undefined,
        recentlyPlayed: [],
        volume: 50,
        isSoundLoading: false,
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
    subscribeToRemotePlayer({ dispatch }) {
        const remotePlayRef = firebase
            .database()
            .ref('/remotePlay/' + firebase.auth().currentUser.uid)

        remotePlayRef.on('child_changed', snapshot => {
            dispatch(
                'player/triggerRemotePlaySound',
                { deviceId: snapshot.key, slotId: snapshot.val()['slotId'] },
                { root: true }
            )
        })
    },
    triggerRemotePlaySound({ rootState, dispatch }, params) {
        const { activeBoard } = rootState.board
        const { remoteDevices } = rootState.remoteDevices
        const device = remoteDevices.filter(
            device => device.id === params.deviceId
        )[0]
        console.log(device)
        if (!device || !activeBoard) return
        const soundId = device[activeBoard.id].slots[params.slotId]

        if (!soundId) return

        dispatch(
            'player/playRemoteSound',
            { id: soundId, source: 'hardware' },
            { root: true }
        )
    },
    subscribeToPlayer({ rootState, rootGetters, commit }, params) {
        const { user, boardUsers } = rootState.user
        const { activeBoard } = rootState.board
        let skipInitial =
            params && params.skipInitial ? params.skipInitial : true

        if (!activeBoard) return

        const playRef = firebase.database().ref('/play/' + activeBoard.id)

        playRef.on('value', async snapshot => {
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

            const playedSound = {
                ...play,
                skip,
                soundUrl,
                timestamp: new Date(),
            }
            commit('updatePlayedSound', { playedSound })

            const sound = rootState.sound.sounds.filter(
                sound => sound.id === play.soundId
            )[0]
            const playedByUser = boardUsers.filter(
                user => user.id === play.playedBy
            )[0]
            commit('addRecentlyPlayed', {
                sound: sound,
                user: playedByUser,
            })
        })
    },
    async playRemoteSound({ dispatch, rootState }, params) {
        const { user, mutedUsers } = rootState.user
        const { activeBoard } = rootState.board
        const {
            id,
            source = window.ipcRenderer !== undefined ? 'desktop' : 'web',
            random = false,
        } = params
        if (!mutedUsers.includes(user.uid)) {
            dispatch('toggleSoundLoading', true)
        }
        await firebase
            .database()
            .ref('/play/' + activeBoard.id)
            .set({
                uuid: uuidv4(),
                soundId: id,
                playedBy: user.uid,
                mutedUsers,
                random,
                source,
            })
    },
    toggleSoundLoading({ commit }, value) {
        commit('toggleSoundLoading', value)
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
    toggleSoundLoading(state, value) {
        state.isSoundLoading = value
    },
    updatePlayedSound(state, { playedSound }) {
        state.playedSound = playedSound
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
