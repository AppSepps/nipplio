<template>
    <q-item>
        <q-item-section avatar :class="{ 'user-disabled': !user.connected }">
            <q-avatar v-if="user.photoURL">
                <img v-if="user.photoURL" :src="user.photoURL" />
            </q-avatar>
            <q-avatar
                v-else
                :color="isCurrentUser ? 'primary' : 'secondary'"
                text-color="white"
            >
                <div>{{ user.displayName[0].toUpperCase() }}</div>
            </q-avatar>
        </q-item-section>
        <q-item-section :class="{ 'user-disabled': !user.connected }">
            <q-item-label>{{ user.displayName }}</q-item-label>
            <q-item-label caption>{{
                user.connected ? 'Connected' : 'Disconnected'
            }}</q-item-label>
        </q-item-section>
        <q-item-section
            avatar
            v-if="!isCurrentUser && user.connected"
            :class="{ 'user-disabled': !user.connected }"
        >
            <q-icon
                :name="user.muted ? 'headset_off' : 'headset'"
                color="secondary"
            />
        </q-item-section>
        <q-item-section
            avatar
            v-if="!isCurrentUser && user.connected"
            :class="{ 'user-disabled': !user.connected }"
        >
            <q-btn
                unelevated
                flat
                round
                :icon="muted ? 'music_off' : 'music_note'"
                :color="muted ? 'red' : 'primary'"
                @click="onToggleUserMute(user.id)"
            />
        </q-item-section>
    </q-item>
</template>

<script>
export default {
    name: 'User',
    props: ['user', 'muted', 'isCurrentUser'],
    components: {},
    methods: {
        async onToggleUserMute(id) {
            await this.$store.dispatch('app/toggleUserMute', { id })
        },
    },
}
</script>

<style></style>
