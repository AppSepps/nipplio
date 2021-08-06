<template>
    <q-item>
        <q-item-section avatar>
            <q-icon name="settings_remote" />
        </q-item-section>
        <q-item-section>
            <q-item-label>{{ device.name }}</q-item-label>
            <q-item-label caption>{{ device.addresses[0] }}</q-item-label>
        </q-item-section>
        <q-item-section avatar>
            <q-btn
                v-if="!device.loading"
                unelevated
                flat
                label="add SoundMapping"
                icon="add_circle"
                color="primary"
                @click="addSoundMappingToDevice(device.addresses[0])"
            />
        </q-item-section>
        <q-item-section avatar>
            <q-btn
                v-if="!device.loading"
                unelevated
                flat
                label="login"
                icon="login"
                color="primary"
                @click="onAddDeviceClicked(device.addresses[0])"
            />
            <q-circular-progress
                v-if="device.loading"
                indeterminate
                size="sm"
            />
        </q-item-section>
    </q-item>
</template>

<script>
export default {
    name: 'RemoteDevice',
    props: ['device'],
    methods: {
        onAddDeviceClicked: function (ipAddress) {
            this.$store.dispatch('settings/loginOnDevice', ipAddress)
        },
        addSoundMappingToDevice: function (ipAddress) {
            this.$store.dispatch('settings/addSoundMappingToDevice', ipAddress)
        },
    },
}
</script>

<style></style>
