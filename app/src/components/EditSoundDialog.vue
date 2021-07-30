<template>
    <q-dialog>
        <q-card style="width: 300px; max-width: 80vw">
            <q-form @submit="onSubmit">
                <q-card-section class="row items-center">
                    <div class="text-h6">Edit Sound</div>
                    <q-space />
                    <q-btn icon="close" flat round dense v-close-popup />
                </q-card-section>
                <q-card-section v-if="sound">
                    <q-input
                        filled
                        v-model="name"
                        label="Name"
                        placeholder="Awesome sound"
                    />
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn
                        no-caps
                        label="Save"
                        color="primary"
                        v-close-popup
                        type="submit"
                    />
                </q-card-actions>
            </q-form>
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
            name: '',
        }
    },
    mounted() {
        this.bus.on('onSoundEditClick', (sound) => {
            this.sound = sound
            this.name = sound.name
        })
    },
    methods: {
        onSubmit() {
            this.$store.dispatch('sound/onSoundEdit', {
                ...this.sound,
                name: this.name,
            })
        },
    },
}
</script>

<style></style>
