<template>
    <q-dialog
        transition-show="slide-up"
        transition-hide="slide-down"
        full-width
        full-height
    >
        <q-card>
            <q-card-section class="row items-center">
                <div class="text-h6">Settings</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>
            <q-card-section>
                <div class="row q-pb-md">
                    <q-list class="col-6">
                        <q-item-label header>Desktop App Settings</q-item-label>
                        <q-item clickable>
                            <q-item-section>
                                <q-item-label>Nothing here yet</q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-separator spaced />
                    </q-list>
                </div>
                <div class="row q-pb-md">
                    <q-list class="col-6">
                        <q-item-label header>Discovered Devices</q-item-label>
                        <remote-device
                            v-for="(device, index) in discoveredDevices"
                            :key="index"
                            :device="device"
                        />
                    </q-list>
                </div>
                <q-btn
                    no-caps
                    unelevated
                    color="negative"
                    label="Sign out"
                    @click="signOut"
                />
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script>
import { sendToIPCRenderer } from '../helpers/electron.helper'
import firebase from 'firebase'
import { mapState } from 'vuex'
import RemoteDevice from '../components/RemoteDevice.vue'

export default {
    name: 'Settings',
    components: { RemoteDevice },
    computed: {
        ...mapState({
            discoveredDevices: (state) => state.settings.discoveredDevices,
        }),
    },
    methods: {
        signOut: async function () {
            await firebase.auth().signOut()
            this.$store.dispatch('player/unsubscribeToPlayer')
            this.$store.dispatch('clearAll')
            this.$router.push('/login')
        },
    },
    mounted() {
        sendToIPCRenderer('startScanForDevices')
    },
    unmounted() {
        sendToIPCRenderer('stopScanForDevices')
    },
}
</script>

<style></style>
