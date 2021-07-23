<template>
    <q-dialog>
        <q-card>
            <q-card-section class="row items-center">
                <div class="text-h6">Edit Sound</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>
            <q-card-section class="row items-center">
                {{ sound }}
            </q-card-section>
            <q-card-actions align="right">
                <q-btn
                    no-caps
                    label="Save"
                    color="primary"
                    v-close-popup
                    @click="onSubmit"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
export default {
    name: 'EditSoundDialog',
    components: {},
    data() {
        return {
            sound: undefined,
        }
    },
    mounted() {
        this.bus.on('onSoundEditClick', (sound) => {
            this.sound = sound
        })
    },
    methods: {
        onSubmit() {
            this.$store.dispatch('app/editSound', { sound: this.sound })
        },
    },
}
</script>

<style></style>
