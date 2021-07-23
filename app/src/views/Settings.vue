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
                                    service.addresses
                                }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-btn
                                    unelevated
                                    flat
                                    round
                                    icon="add"
                                    color="primary"
                                    @click="addDeviceToUser(user.id)"
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
import { mapState } from 'vuex'
export default {
    name: 'Settings',
    components: {},
    computed: {
        ...mapState({
            discoveredDevices: state => state.settings.discoveredDevices,
        }),
    },
    methods: {
        signOut: function() {
            this.$store.dispatch('app/signOut')
            this.$router.push('/login')
        },
    },
    mounted() {
        //this.$store.dispatch('settings/resetDeviceList')
    },
}
</script>

<style></style>
