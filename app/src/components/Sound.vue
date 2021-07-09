<template>
    <q-item>
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
            <q-item-label caption>{{ sound.createdBy }}</q-item-label>
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
                            @click="onEditClick(sound.id)"
                        >
                            <q-item-section avatar>
                                <q-icon name="edit" />
                            </q-item-section>
                            <q-item-section>Edit</q-item-section>
                        </q-item>
                        <q-item
                            clickable
                            v-close-popup
                            @click="onDeleteClick(sound.id)"
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
    props: ['sound'],
    components: {},
    methods: {
        onSoundPlay: async function (id) {
            await this.$store.dispatch('app/triggerPlaySound', { id })
        },
        onFavoriteToggle: async function (id) {
            await this.$store.dispatch('app/toggleFavoriteSound', { id })
        },
        onEditClick: async function (id) {
            console.log('Trying to edit sound ' + id)
        },
        onDeleteClick: async function (id) {
            console.log('Trying to delete sound ' + id)
        },
    },
}
</script>

<style></style>
