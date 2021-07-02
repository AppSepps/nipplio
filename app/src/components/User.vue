<template>
    <q-item>
        <q-item-section avatar>
            <q-avatar
                :color="isCurrentUser ? 'primary' : 'secondary'"
                text-color="white"
            >
                {{ user.username[0].toUpperCase() }}
            </q-avatar>
        </q-item-section>
        <q-item-section>
            <q-item-label>{{ user.username }}</q-item-label>
            <q-item-label caption>Not connected</q-item-label>
        </q-item-section>
        <q-item-section avatar v-if="!isCurrentUser">
            <q-btn
                unelevated
                flat
                round
                :icon="muted ? 'mic_off' : 'mic'"
                :color="muted ? 'red' : 'primary'"
                @click="onToggleUserMute(user.id)"
            />
        </q-item-section>
    </q-item>
</template>

<script>
export default {
    name: 'User',
    props: ['user', 'isCurrentUser', 'muted'],
    components: {},
    methods: {
        async onToggleUserMute(id) {
            await this.$store.dispatch('app/toggleUserMute', { id })
        },
    },
}
</script>

<style></style>
