<template>
    <div>
        <q-btn
            no-caps
            unelevated
            color="primary"
            label="Search for new Hardware Devices"
            @click="searchNewHardwareDevices"
        />
        <div class="row q-pb-sm">
            <q-list class="col-6">
                <remote-device
                    v-for="(device, index) in remoteDevices"
                    :key="index"
                    :device="device"
                    :linked="true"
                    v-on:openDialog="openSlotMappingDialog()"
                />
            </q-list>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import RemoteDevice from '../components/RemoteDevice.vue'

export default {
    name: 'RemoteDevices',
    components: { RemoteDevice },
    methods: {
        ...mapActions('remoteDevices', ['searchNewHardwareDevices']),
        openSlotMappingDialog: function() {
            this.$emit('openSlotMappingDialog')
        },
    },
    computed: {
        ...mapGetters('remoteDevices', ['remoteDevices']),
    },
    mounted() {
        this.$store.dispatch('remoteDevices/subscribeToRemoteDevices')
    },
}
</script>

<style></style>
