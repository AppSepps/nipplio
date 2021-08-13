<template>
    <q-item>
        <q-item-section avatar>
            <q-icon name="memory" />
        </q-item-section>
        <q-item-section>
            <q-item-label>{{ linked ? device.id : device.name }}</q-item-label>
            <q-item-label caption>{{
                linked ? `${device.slots.length} Slots` : device.addresses[0]
            }}</q-item-label>
        </q-item-section>
        <q-item-section avatar v-if="linked"> </q-item-section>
        <q-item-section avatar>
            <div :class="device.loading ? 'rotating' : ''" v-if="!linked">
                <q-btn
                    unelevated
                    flat
                    round
                    :icon="device.loading ? 'sync' : 'add_link'"
                    :disable="device.loading"
                    color="secondary"
                    @click="onAddDeviceClicked(device.addresses[0])"
                >
                    <q-tooltip
                        class="bg-grey-9"
                        :delay="500"
                        :offset="[0, 10]"
                        >{{
                            device.loading
                                ? 'Syncing...'
                                : 'Link device to user'
                        }}</q-tooltip
                    >
                </q-btn>
            </div>
            <div v-else>
                <q-btn
                    unelevated
                    flat
                    round
                    icon="settings_applications"
                    color="white"
                    @click="onChangeSlotMappingClicked(device)"
                >
                    <q-tooltip class="bg-grey-9" :delay="500" :offset="[0, 10]"
                        >Configure Slots</q-tooltip
                    >
                </q-btn>
                <q-btn
                    unelevated
                    flat
                    round
                    icon="link_off"
                    color="secondary"
                    @click="onUnlinkDeviceClicked(device.id)"
                >
                    <q-tooltip class="bg-grey-9" :delay="500" :offset="[0, 10]"
                        >Unlink device</q-tooltip
                    >
                </q-btn>
            </div>
        </q-item-section>
    </q-item>
</template>

<script>
export default {
    name: 'RemoteDevice',
    props: ['device', 'linked'],
    methods: {
        onAddDeviceClicked: function (ipAddress) {
            this.$store.dispatch('settings/registerRemoteDevice', ipAddress)
        },
        onUnlinkDeviceClicked: function (ipAddress) {
            this.$store.dispatch('settings/unlinkRemoteDevice', ipAddress)
        },
        onChangeSlotMappingClicked: function (device) {
            this.$emit('openDialog')
            this.bus.emit('onChangeSlotMapping', device)
        },
    },
}
</script>

<style></style>
