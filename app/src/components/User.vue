<template>
    <q-item>
        <q-item-section avatar>
            <q-avatar color="secondary" text-color="white">
                {{ user.username[0].toUpperCase() }}
            </q-avatar>
        </q-item-section>
        <q-item-section>
            <q-item-label>{{ user.username }}</q-item-label>
            <q-item-label caption>Not connected</q-item-label>
        </q-item-section>
        <q-item-section avatar>
            <q-btn unelevated flat round icon="mic_off" color="red" />
        </q-item-section>
    </q-item>
</template>

<script>
export default {
    name: 'User',
    props: ['user'],
    components: {},
    methods: {},
}
</script>

<style></style>
