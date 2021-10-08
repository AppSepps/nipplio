import { requestDevice } from '../../helpers/webusb.helper'
import firebase from 'firebase'

function initialState() {
    return {
        remoteDevices: [],
    }
}

const getters = {
    remoteDevices: function(state) {
        return state.remoteDevices
    },
}

const actions = {
    async searchNewHardwareDevices({ dispatch }) {
        let device = await requestDevice()
        console.log(device)
        await dispatch('addDeviceToFirebaseRemoteDevices', device)
    },
    async addDeviceToFirebaseRemoteDevices(context, usbDevice) {
        let slots = {
            '0': 'Button 1',
            '1': 'Button 2',
            '2': 'Button 3',
            '3': 'Button 4',
            '4': 'Button 5',
            '5': 'Button 6',
            '6': 'Button 7',
        }
        await firebase
            .database()
            .ref(
                `users/${firebase.auth().currentUser.uid}/remoteDevices/${
                    usbDevice.serialNumber
                }/slots`
            )
            .set(slots)
    },
    subscribeToRemoteDevices({ commit, rootState }) {
        const user = firebase.auth().currentUser
        const deviceRef = firebase
            .database()
            .ref(`/users/${user.uid}/remoteDevices`)

        deviceRef.on('child_added', snapshot => {
            const obj = {
                id: snapshot.key,
                ...snapshot.val(),
            }
            const foundDeviceWithSameId = rootState.remoteDevices.remoteDevices.filter(
                device => device.id === snapshot.key
            )
            if (foundDeviceWithSameId.length === 0) {
                commit('addRemoteDevice', obj)
            }
        })

        deviceRef.on('child_changed', snapshot => {
            commit('changeRemoteDevice', {
                id: snapshot.key,
                ...snapshot.val(),
            })
        })

        deviceRef.on('child_removed', snapshot => {
            commit('removeRemoteDevice', {
                id: snapshot.key,
            })
        })
    },
}

const mutations = {
    addRemoteDevice(state, device) {
        state.remoteDevices.push(device)
    },
    changeRemoteDevice(state, device) {
        state.remoteDevices = state.remoteDevices.map(d => {
            return d.id === device.id ? device : d
        })
    },
    removeRemoteDevice(state, { id }) {
        state.remoteDevices = state.remoteDevices.filter(
            device => device.id !== id
        )
    },
}

export default {
    namespaced: true,
    state: initialState,
    getters,
    actions,
    mutations,
}
