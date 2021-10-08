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
                <RemoteDevices
                    v-on:openSlotMappingDialog="
                        this.$emit('openSlotMappingDialog')
                    "
                />
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
import firebase from 'firebase'
import { mapActions, mapGetters } from 'vuex'
import { copyToClipboard } from 'quasar'
import RemoteDevices from '../components/RemoteDevices.vue'

export default {
    name: 'Settings',
    components: { RemoteDevices },
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
        ...mapActions('settings', ['addApiKey', 'deleteApiKey']),
        signOut: async function() {
            await firebase.auth().signOut()
            this.$store.dispatch('player/unsubscribeToPlayer')
            this.$store.dispatch('clearAll')
            this.$router.push('/welcome')
        },
    },
    async mounted() {},
    unmounted() {},
}
</script>

<style></style>
