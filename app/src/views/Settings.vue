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
                <div class="row q-pb-sm">
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
                <div v-if="isOwner" class="row q-pb-sm">
                    <q-list class="col-6">
                        <q-item-label header
                            >API Keys

                            <q-btn
                                flat
                                round
                                @click="addApiKey"
                                color="secondary"
                                icon="add"
                        /></q-item-label>
                        <q-item v-for="apiKey in apiKeys" :key="apiKey">
                            <q-item-label>{{ apiKey }}</q-item-label>
                            <q-btn
                                color="secondary"
                                icon="assignment"
                                @click="copyToClipboard(apiKey)"
                            />
                            <q-btn
                                color="secondary"
                                icon="delete"
                                @click="deleteApiKey(apiKey)"
                            />
                        </q-item>
                        <q-separator spaced />
                    </q-list>
                </div>
                <div class="row q-pb-sm">
                    <q-list class="col-6">
                        <q-item-label header v-if="remoteDevices.length > 0"
                            >Linked Devices -
                            {{ remoteDevices.length }}</q-item-label
                        >
                        <remote-device
                            v-for="(device, index) in remoteDevices"
                            :key="index"
                            :device="device"
                            :linked="true"
                            v-on:openDialog="openSlotMappingDialog()"
                        />
                        <q-item-label header
                            >Discovered Devices -
                            {{ filteredDiscoveredDevices.length }}</q-item-label
                        >
                        <remote-device
                            v-for="(device, index) in filteredDiscoveredDevices"
                            :key="index"
                            :device="device"
                            :linked="false"
                        />
                        <q-item v-if="filteredDiscoveredDevices.length === 0">
                            <q-item-section>
                                <q-item-label
                                    >No devices discovered...</q-item-label
                                >
                            </q-item-section>
                        </q-item>
                    </q-list>
                </div>
                <q-btn
                    no-caps
                    unelevated
                    color="primary"
                    label="Pair Bluetooth Board"
                    @click="bleButtonScanClicked"
                />
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
import { mapActions, mapGetters } from 'vuex'
import RemoteDevice from '../components/RemoteDevice.vue'
import { copyToClipboard } from 'quasar'

export default {
    name: 'Settings',
    components: { RemoteDevice },
    created() {
        this.copyToClipboard = copyToClipboard
    },
    computed: {
        ...mapGetters('settings', [
            'filteredDiscoveredDevices',
            'isOwner',
            'remoteDevices',
            'apiKeys',
        ]),
    },
    methods: {
        ...mapActions('settings', [
            'bleButtonScanClicked',
            'addApiKey',
            'deleteApiKey',
        ]),
        openSlotMappingDialog: function() {
            this.$emit('openSlotMappingDialog')
        },
        signOut: async function() {
            await firebase.auth().signOut()
            this.$store.dispatch('player/unsubscribeToPlayer')
            this.$store.dispatch('clearAll')
            this.$router.push('/welcome')
        },
    },
    async mounted() {
        sendToIPCRenderer('startScanForDevices')
        await this.$store.dispatch('settings/autoConnect')
    },
    unmounted() {
        sendToIPCRenderer('stopScanForDevices')
    },
}
</script>

<style></style>
