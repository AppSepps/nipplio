<template>
    <q-btn
        unelevated
        round
        flat
        :icon="selfMute ? 'music_off' : 'audiotrack'"
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
            await this.$store.dispatch('app/toggleSelfMute')
        },
    },
}
</script>

<style></style>
