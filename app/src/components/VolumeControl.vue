<template>
    <q-item>
        <q-item-section class="q-mx-md">
            <q-icon :name="icon" size="20px" />
        </q-item-section>
        <div style="min-width: 100px">
            <q-slider
                :color="volume ? 'primary' : 'grey'"
                v-model="volume"
                :min="0"
                :max="100"
                :step="5"
            />
        </div>
    </q-item>
</template>

<script>
import { ref } from 'vue'
import { mapState, useStore } from 'vuex'

export default {
    name: 'VolumeControl',
    setup() {
        const store = useStore()
        return {
            volume: ref(store.state.player.volume),
        }
    },
    computed: mapState({
        icon: (state) => {
            const volume = state.player.volume
            if (volume == 0) {
                return 'volume_off'
            } else if (volume < 33) {
                return 'volume_mute'
            } else if (volume < 66) {
                return 'volume_down'
            } else {
                return 'volume_up'
            }
        },
    }),
    watch: {
        volume(val) {
            this.$store.dispatch('player/onVolumeChange', { volume: val })
        },
    },
}
</script>

<style></style>
