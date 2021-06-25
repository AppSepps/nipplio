<template>
    <q-item>
        <q-item-section avatar>
            <q-btn
                unelevated
                round
                icon="play_arrow"
                color="positive"
                @click="onSoundPlay(sound.id)"
            />
        </q-item-section>
        <q-item-section>
            <q-item-label>{{ sound.name }}</q-item-label>
            <q-item-label caption>{{ sound['User'].username }}</q-item-label>
        </q-item-section>
        <q-item-section avatar>
            <q-btn
                unelevated
                flat
                round
                icon="favorite_border"
                color="negative"
            />
        </q-item-section>
    </q-item>
</template>

<script>
export default {
    name: 'Sound',
    props: ['sound'],
    components: {},
    methods: {
        onSoundPlay: async function (id) {
            await this.$store.dispatch('app/playSound', { id })
        },
    },
}
</script>

<style></style>
