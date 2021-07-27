<template>
    <q-item
        @mouseover="hover = true"
        @mouseleave="hover = false"
        :clickable="user.connected"
        :class="{ 'user-disabled': !user.connected }"
    >
        <q-item-section avatar>
            <q-avatar v-if="user.photoURL">
                <img v-if="user.photoURL" :src="user.photoURL" />
                <user-mute-indicator
                    v-if="user.connected"
                    :muted="user.muted"
                />
            </q-avatar>
            <q-avatar
                v-else
                :color="isCurrentUser ? 'primary' : 'secondary'"
                text-color="white"
            >
                <div>{{ user.displayName[0].toUpperCase() }}</div>
                <user-mute-indicator
                    v-if="user.connected"
                    :muted="user.muted"
                />
            </q-avatar>
        </q-item-section>
        <q-item-section>
            <q-item-label>{{ user.displayName }}</q-item-label>
        </q-item-section>
        <q-item-section avatar v-if="hover && user.connected">
            <q-btn
                unelevated
                flat
                round
                icon="speaker"
                :color="'primary'"
                @click="onSelectSpeaker(user.id)"
            />
        </q-item-section>
        <q-item-section avatar v-if="user.connected">
            <q-btn
                unelevated
                flat
                round
                :disable="isCurrentUser"
                :icon="muted ? 'volume_off' : 'volume_up'"
                :color="muted ? 'red' : 'white'"
                @click="onToggleUserMute(user.id)"
            />
        </q-item-section>
    </q-item>
</template>

<script>
import UserMuteIndicator from './UserMuteIndicator.vue'

export default {
    name: 'User',
    props: ['user', 'muted', 'isCurrentUser'],
    components: { UserMuteIndicator },
    data() {
        return {
            hover: false,
        }
    },
    methods: {
        async onToggleUserMute(id) {
            await this.$store.dispatch('app/toggleUserMute', { id })
        },
        async onSelectSpeaker(id) {
            await this.$store.dispatch('app/selectSpeaker', { id })
        },
    },
}
</script>

<style></style>
