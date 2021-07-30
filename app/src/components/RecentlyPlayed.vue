<template>
    <q-item-section avatar>
        <q-btn
            round
            unelevated
            flat
            icon="history"
            :disabled="recentlyPlayed.length === 0"
        >
            <q-menu>
                <q-list style="min-width: 100px">
                    <q-item
                        v-for="(played, index) in recentlyPlayed"
                        :key="index"
                        clickable
                        v-close-popup
                        @click="onRecentlyPlayedClicked(played.soundId)"
                    >
                        <q-item-section avatar>
                            <q-item-label>
                                [{{ moment(played.timestamp).format('LTS') }}]
                            </q-item-label>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>{{ played.name }}</q-item-label>
                            <q-item-label caption>{{
                                played.user.displayName
                            }}</q-item-label>
                        </q-item-section>
                        <q-item-section avatar>
                            <q-icon name="play_arrow" />
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-menu>
        </q-btn>
    </q-item-section>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'

export default {
    name: 'RecentlyPlayed',
    created() {
        this.moment = moment
    },
    computed: mapState({
        recentlyPlayed: (state) => state.player.recentlyPlayed,
    }),
    methods: {
        onRecentlyPlayedClicked(soundId) {
            this.$store.dispatch('player/playRemoteSound', { id: soundId })
        },
    },
}
</script>

<style></style>
