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
                <q-card-section v-if="sound">
                    <q-select
                        filled
                        label="Tags"
                        v-model="tags"
                        use-input
                        use-chips
                        multiple
                        input-debounce="0"
                        @new-value="createValue"
                        :options="filterOptions"
                        @filter="filterFn"
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
import { mapGetters } from 'vuex'

export default {
    name: 'EditSoundDialog',
    components: {},
    data() {
        return {
            sound: undefined,
            name: '',
            tags: [],
            filterOptions: [],
        }
    },
    computed: {
        ...mapGetters('sound', ['availableTags']),
    },
    mounted() {
        this.bus.on('onSoundEditClick', sound => {
            this.sound = sound
            this.name = sound.name
            this.tags = sound.tags ? sound.tags.split(',') : []
            this.filterOptions = this.availableTags
        })
    },
    methods: {
        filterFn(val, update) {
            update(() => {
                console.log(val)
                if (val === '') {
                    this.filterOptions = this.availableTags
                } else {
                    const needle = val.toLowerCase()
                    this.filterOptions = this.availableTags.filter(
                        v => v.toLowerCase().indexOf(needle) > -1
                    )
                }
            })
        },
        createValue(val, done) {
            if (val.length > 0) {
                if (!this.availableTags.includes(val)) {
                    this.availableTags.push(val)
                }
                done(val, 'toggle')
            }
        },
        onSubmit() {
            this.$store.dispatch('sound/onSoundEdit', {
                ...this.sound,
                name: this.name,
                tags: this.tags.join(','),
            })
        },
    },
}
</script>

<style></style>
