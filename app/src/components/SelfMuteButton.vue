<template>
    <q-btn
        unelevated
        round
        flat
        :icon="selfMute ? 'headset_off' : 'headset'"
        color="secondary"
        @click="onMuteToggle"
    />
</template>

<script>
export default {
    name: 'SelfMuteButton',
    props: ['selfMute'],
    components: {},
    methods: {
        onMuteToggle: async function () {
            await this.$store.dispatch('sound/toggleSelfMute')
        },
    },
}
</script>

<style></style>
