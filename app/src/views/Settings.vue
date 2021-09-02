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
                        <q-item-label header
                            >Gamepads
                            {{ detectedGamepads.length }}</q-item-label
                        >
                        <gamepad-device
                            v-for="(gamepad, index) in detectedGamepads"
                            :key="index"
                            :gamepad="gamepad"
                            :linked="false"
                        />
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
import GamepadDevice from '../components/GamepadDevice.vue'
import { copyToClipboard } from 'quasar'
import 'joypad.js'

export default {
    name: 'Settings',
    components: { RemoteDevice, GamepadDevice },
    created() {
        this.copyToClipboard = copyToClipboard
    },
    computed: {
        ...mapGetters('settings', [
            'filteredDiscoveredDevices',
            'isOwner',
            'remoteDevices',
            'apiKeys',
            'detectedGamepads',
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
        gamepadConnectionHandler(event) {
            console.log('Gamepad Connected: ' + event.gamepad.id)
            this.$store.dispatch('settings/gamepadConnected', event)
        },
        gamepadDisconnectionHandler(event) {
            console.log('Gamepad Disconnected: ' + event.gamepad.id)
            this.$store.dispatch('settings/gamepadDisconnected', event)
        },
        gamepadButtonPressed(gamepad, index) {
            this.$store.dispatch('settings/gamepadButtonPressed', {
                gamepad,
                index,
            })
        },
    },
    async mounted() {
        sendToIPCRenderer('startScanForDevices')
        window.joypad.on('connect', e => {
            this.gamepadConnectionHandler(e)
        })
        window.joypad.on('disconnect', e => {
            this.gamepadDisconnectionHandler(e)
        })
        window.joypad.on('button_press', e => {
            const { gamepad, buttonName, index } = e.detail
            console.log(e)

            console.log(`${buttonName} was pressed!`)
            this.gamepadButtonPressed(gamepad, index)
        })
        /*window.addEventListener(
            'gamepadconnected',
            this.gamepadConnectionHandler
        )
        window.addEventListener(
            'gamepaddisconnected',
            this.gamepadDisconnectionHandler
        )
        this.cycle()
        */
        //await this.$store.dispatch('settings/autoConnect')
    },
    unmounted() {
        sendToIPCRenderer('stopScanForDevices')
    },
}
</script>

<style></style>
