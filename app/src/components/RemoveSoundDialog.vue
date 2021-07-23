<template>
    <q-dialog persistent>
        <q-card>
            <q-card-section class="row items-center">
                <div class="text-h6">Confirm delete</div>
            </q-card-section>
            <q-card-section class="row items-center">
                Are you sure, you want to delete this sound from the board?
            </q-card-section>
            <q-card-actions align="right">
                <q-btn
                    no-caps
                    flat
                    label="Cancel"
                    color="white"
                    v-close-popup
                />
                <q-btn
                    no-caps
                    label="Delete"
                    color="red"
                    v-close-popup
                    @click="onRemoveConfirm"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
export default {
    name: 'RemoveSoundDialog',
    components: {},
    data() {
        return {
            soundId: undefined,
        }
    },
    mounted() {
        this.bus.on('onSoundRemoveClick', (soundId) => {
            this.soundId = soundId
        })
    },
    methods: {
        onRemoveConfirm() {
            this.$store.dispatch('app/removeSound', { soundId: this.soundId })
        },
    },
}
</script>

<style></style>
