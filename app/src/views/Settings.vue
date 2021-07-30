<template>
    <q-dialog
        persistent
        maximized
        transition-show="slide-up"
        transition-hide="slide-down"
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
                                <q-item-label
                                    >Window toggle short cut</q-item-label
                                >
                                <q-item-label caption
                                    >Click to choose a new short cut for
                                    toggling the desktop app window on
                                    MacOS</q-item-label
                                >
                            </q-item-section>
                            <q-item-section side>
                                <q-item-label class="text-weight-bolder"
                                    >CMD+P</q-item-label
                                >
                            </q-item-section>
                        </q-item>
                        <q-item clickable>
                            <q-item-section>
                                <q-item-label>Self mute short cut</q-item-label>
                                <q-item-label caption
                                    >Click to choose a new short cut for
                                    toggling the self mute on the MacOS desktop
                                    app</q-item-label
                                >
                            </q-item-section>
                            <q-item-section side>
                                <q-item-label class="text-weight-bolder"
                                    >CMD+Alt+O</q-item-label
                                >
                            </q-item-section>
                        </q-item>
                        <q-separator spaced />
                    </q-list>
                </div>
                <div class="row q-pb-md">
                    <q-list class="col-6">
                        <q-item-label header>Discovered Devices</q-item-label>
                        <q-item
                            v-for="(service, index) in discoveredDevices"
                            :key="index"
                        >
                            <q-item-section avatar>
                                <q-icon name="settings_remote" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>{{ service.name }}</q-item-label>
                                <q-item-label caption>{{
                                    service.addresses[0]
                                }}</q-item-label>
                                <q-item-label caption>{{
                                    service.config
                                }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-btn
                                    v-if="!service.loading"
                                    unelevated
                                    flat
                                    round
                                    label="login"
                                    icon="login"
                                    color="primary"
                                    @click="
                                        onAddDeviceClicked(service.addresses[0])
                                    "
                                />
                                <q-btn
                                    v-if="!service.loading"
                                    unelevated
                                    flat
                                    round
                                    label="add Board"
                                    icon="add_circle"
                                    color="primary"
                                    @click="
                                        onAddDeviceToCurrentBoard(
                                            service.addresses[0]
                                        )
                                    "
                                />
                                <q-btn
                                    v-if="!service.loading"
                                    unelevated
                                    flat
                                    round
                                    label="add SoundMapping"
                                    icon="add_circle"
                                    color="primary"
                                    @click="
                                        addSoundMappingToDevice(
                                            service.addresses[0]
                                        )
                                    "
                                />

                                <q-btn
                                    v-if="!service.loading"
                                    unelevated
                                    flat
                                    round
                                    icon="refresh"
                                    label="get Config"
                                    color="primary"
                                    @click="
                                        getDeviceConfig(service.addresses[0])
                                    "
                                />

                                <q-circular-progress
                                    v-if="service.loading"
                                    indeterminate
                                    size="sm"
                                />
                            </q-item-section>
                        </q-item>
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
import firebase from 'firebase'
import { mapState } from 'vuex'

export default {
    name: 'Settings',
    components: {},
    computed: {
        ...mapState({
            discoveredDevices: (state) => state.settings.discoveredDevices,
        }),
    },
    methods: {
        onAddDeviceClicked: function (ipAddress) {
            console.log(ipAddress)
            this.$store.dispatch('settings/loginOnDevice', ipAddress)
        },
        onAddDeviceToCurrentBoard: function (ipAddress) {
            console.log(ipAddress)
            this.$store.dispatch('settings/addDeviceToCurrentBoard', ipAddress)
        },
        getDeviceConfig: function (ipAddress) {
            console.log(ipAddress)
            this.$store.dispatch('settings/getDeviceConfig', ipAddress)
        },
        addSoundMappingToDevice: function (ipAddress) {
            console.log(ipAddress)
            this.$store.dispatch('settings/addSoundMappingToDevice', ipAddress)
        },
        signOut: async function () {
            await firebase.auth().signOut()
            this.$store.dispatch('player/unsubscribeToPlayer')
            this.$store.dispatch('clearAll')
            this.$router.push('/login')
        },
    },
    mounted() {
        try {
            window.ipcRenderer.send('startScanForDevices')
        } catch (error) {
            // Is Web Instance
        }
        //this.$store.dispatch('settings/resetDeviceList')
    },
    unmounted() {
        try {
            window.ipcRenderer.send('stopScanForDevices')
        } catch (error) {
            // Is Web Instance
        }
    },
}
</script>

<style></style>
