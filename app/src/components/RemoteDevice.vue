<template>
    <q-item>
        <q-item-section avatar>
            <q-icon name="memory" />
        </q-item-section>
        <q-item-section>
            <q-item-label>{{ device.name }}</q-item-label>
            <q-item-label caption>{{ device.addresses[0] }}</q-item-label>
        </q-item-section>
        <q-item-section avatar>
            <div :class="device.loading ? 'rotating' : ''">
                <q-btn
                    unelevated
                    flat
                    round
                    :icon="device.loading ? 'sync' : 'add_link'"
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
        </q-item-section>
    </q-item>
</template>

<script>
export default {
    name: 'RemoteDevice',
    props: ['device'],
    methods: {
        onAddDeviceClicked: function (ipAddress) {
            this.$store.dispatch('settings/registerRemoteDevice', ipAddress)
        },
    },
}
</script>

<style></style>
