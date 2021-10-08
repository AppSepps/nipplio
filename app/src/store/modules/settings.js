import firebase from 'firebase'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

function initialState() {
    return {
        availableSlotSounds: [],
        discoveredDevices: [],
        remoteDevices: [],
        detectedGamepads: [],
    }
}

const getters = {
    isOwner: function(state, getters, rootState) {
        return (
            rootState.board.activeBoard.owner ===
            firebase.auth().currentUser.uid
        )
    },
    apiKeys: function(state, getters, rootState) {
        return rootState.board.apiKeys
    },
}

const actions = {
    async addApiKey({ rootState }) {
        await firebase
            .database()
            .ref(`/apiKeys/${rootState.board.activeBoard.id}/${uuidv4()}`)
            .set(true)
    },
    async deleteApiKey({ rootState }, apiKey) {
        await firebase
            .database()
            .ref(`/apiKeys/${rootState.board.activeBoard.id}/${apiKey}`)
            .set(null)
    },
    handleNotifications({ dispatch }, event) {
        let value = event.target.value
        console.log(event.currentTarget.service.device.name)
        console.log(event.currentTarget.service.device.id)
        // Convert raw data bytes to hex values just for the sake of showing something.
        // In the "real" world, you'd use data.getUint8, data.getUint16 or even
        // TextDecoder to process raw data bytes.
        const slotPressed = value.getUint8(0).toString()
        console.log(slotPressed)
        dispatch(
            'player/triggerRemotePlaySound',
            {
                slotId: slotPressed,
                deviceId: event.currentTarget.service.device.name,
            },
            { root: true }
        )
    },
    async addSoundMappingToDevice({ dispatch, rootState }, ipAddress) {
        const url = 'http://' + ipAddress + '/setSlotSoundMapping'
        const soundsIdsArray = rootState.sound.sounds.map(sound => sound.id)
        await axios.post(url, soundsIdsArray.slice(0, 5))
        await dispatch('getDeviceConfig', ipAddress)
    },
    async getAvailableSlotSounds({ commit }, { boardId }) {
        try {
            const sounds = await firebase
                .database()
                .ref(`sounds/${boardId}`)
                .once('value')
            commit('addAvailableSlotSounds', sounds.val())
        } catch (error) {
            console.log(error)
        }
    },
    async saveSlotMapping(context, { device, boardId, selectedSounds }) {
        const slotMappingRef = firebase
            .database()
            .ref(
                `/users/${firebase.auth().currentUser.uid}/remoteDevices/${
                    device.id
                }/${boardId}/slots`
            )
        try {
            const slotMapping = {}
            device.slots.forEach((slot, index) => {
                slotMapping[index] = selectedSounds[index]
                    ? selectedSounds[index].id
                    : null
            })
            await slotMappingRef.set(slotMapping)
        } catch (error) {
            console.log(error)
        }
    },
    async unlinkRemoteDevice({ commit }, device) {
        console.log(device)
        commit('setRemoteDeviceLoadingStatus', { device, isLoading: true })
        const idToken = await firebase.auth().currentUser.getIdToken()
        try {
            const url =
                'http://' +
                device.ipAddress +
                '/unpairDevice?idToken=' +
                idToken
            if (device.ipAddress !== undefined) {
                // is HTTP Client. Otherwise it is probably a gamepad
                await axios.get(url)
            }
            const user = firebase.auth().currentUser
            await firebase
                .database()
                .ref(`/users/${user.uid}/remoteDevices/${device.id}`)
                .remove()
        } catch (error) {
            console.log(error)
        }
        commit('setRemoteDeviceLoadingStatus', { device, isLoading: false })
    },
}

const mutations = {
    addAvailableSlotSounds(state, sounds) {
        let availableSounds = []
        for (let [key, value] of Object.entries(sounds)) {
            availableSounds.push({ id: key, ...value })
        }
        availableSounds = availableSounds.sort((a, b) =>
            a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        )
        state.availableSlotSounds = availableSounds
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
