<template>
    <q-item>
        <q-item-section avatar>
            <q-icon name="memory" />
        </q-item-section>
        <q-item-section>
            <q-item-label>{{ gamepad.id }}</q-item-label>
            <q-item-label caption>{{
                `${gamepad.buttons.length} Slots`
            }}</q-item-label>
        </q-item-section>
        <q-item-section avatar v-if="linked"> </q-item-section>
        <q-item-section avatar>
            <div :class="gamepad.loading ? 'rotating' : ''" v-if="!linked">
                <q-btn
                    unelevated
                    flat
                    round
                    :icon="gamepad.loading ? 'sync' : 'add_link'"
                    :disable="gamepad.loading"
                    color="secondary"
                    @click="onAddGamepadClicked(gamepad)"
                >
                    <q-tooltip
                        class="bg-grey-9"
                        :delay="500"
                        :offset="[0, 10]"
                        >{{
                            gamepad.loading
                                ? 'Syncing...'
                                : 'Link gamepad to user'
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
                    @click="onChangeSlotMappingClicked(gamepad)"
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
                    @click="onUnlinkGamepadClicked(gamepad)"
                >
                    <q-tooltip class="bg-grey-9" :delay="500" :offset="[0, 10]"
                        >Unlink gamepad</q-tooltip
                    >
                </q-btn>
            </div>
        </q-item-section>
    </q-item>
</template>

<script>
export default {
    name: 'GamepadGamepad',
    props: ['gamepad', 'linked'],
    methods: {
        onAddGamepadClicked: function(gamepad) {
            this.$store.dispatch('settings/registerGamepad', gamepad)
        },
        onUnlinkGamepadClicked: function(gamepad) {
            this.$store.dispatch('settings/unlinkGamepad', gamepad)
        },
        onChangeSlotMappingClicked: function(gamepad) {
            this.$emit('openDialog')
            this.bus.emit('onChangeSlotMapping', gamepad)
        },
    },
}
</script>

<style></style>
