<template>
    <q-item class="q-py-md">
        <q-item-section avatar>
            <q-btn
                unelevated
                round
                icon="play_arrow"
                color="primary"
                @click="onSoundPlay(sound.id)"
            />
        </q-item-section>
        <q-item-section>
            <q-item-label>{{ sound.name }}</q-item-label>
        </q-item-section>
        <q-item-section avatar>
            <q-btn
                unelevated
                flat
                round
                :icon="sound.favorite ? 'favorite' : 'favorite_border'"
                color="red"
                @click="onFavoriteToggle(sound.id)"
            />
        </q-item-section>
        <q-item-section avatar>
            <q-btn unelevated flat round icon="more_horiz" color="white">
                <q-menu>
                    <q-list style="min-width: 100px">
                        <q-item
                            clickable
                            v-close-popup
                            @click="onInfoClick(sound, user)"
                        >
                            <q-item-section avatar>
                                <q-icon name="info" />
                            </q-item-section>
                            <q-item-section>Info</q-item-section>
                        </q-item>
                        <q-item
                            clickable
                            v-close-popup
                            @click="onEditClick(sound)"
                        >
                            <q-item-section avatar>
                                <q-icon name="edit" />
                            </q-item-section>
                            <q-item-section>Edit</q-item-section>
                        </q-item>
                        <q-item
                            clickable
                            v-close-popup
                            @click="onRemoveClick(sound.id)"
                        >
                            <q-item-section avatar>
                                <q-icon name="delete" color="red" />
                            </q-item-section>
                            <q-item-section class="text-red"
                                >Delete</q-item-section
                            >
                        </q-item>
                    </q-list>
                </q-menu>
            </q-btn>
        </q-item-section>
    </q-item>
</template>

<script>
export default {
    name: 'Sound',
    props: ['sound', 'user'],
    components: {},
    methods: {
        onSoundPlay: async function (id) {
            await this.$store.dispatch('app/triggerPlaySound', { id })
        },
        onFavoriteToggle: async function (id) {
            await this.$store.dispatch('app/toggleFavoriteSound', { id })
        },
        onEditClick: async function (sound) {
            this.$emit('openEditDialog')
            this.bus.emit('onSoundEditClick', sound)
        },
        onInfoClick: async function (sound, user) {
            this.$emit('openInfoDialog')
            this.bus.emit('onSoundInfoClick', { sound, user })
        },
        onRemoveClick: async function (id) {
            this.$emit('openRemoveDialog')
            this.bus.emit('onSoundRemoveClick', id)
        },
    },
}
</script>

<style></style>
