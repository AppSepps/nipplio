<template>
    <q-dialog>
        <q-card style="width: 300px; max-width: 80vw">
            <q-card-section class="row items-center">
                <div class="text-h6">Info</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>
            <q-card-section>
                <q-list>
                    <q-item>
                        <q-item-section avatar>
                            <q-icon name="graphic_eq" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Name</q-item-label>
                            <q-item-label caption href="asdf"
                                ><a :href="sound.downloadUrl">{{
                                    sound.name
                                }}</a></q-item-label
                            >
                        </q-item-section>
                    </q-item>
                    <q-separator spaced />
                    <q-item>
                        <q-item-section avatar>
                            <q-icon name="person" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Uploaded from</q-item-label>
                            <q-item-label caption>{{
                                user.displayName
                            }}</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-separator spaced />
                    <q-item>
                        <q-item-section avatar>
                            <q-icon name="schedule" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Uploaded at</q-item-label>
                            <q-item-label caption>{{
                                moment(sound.createdAt).format('LLL')
                            }}</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-separator spaced />
                    <q-item>
                        <q-item-section avatar>
                            <q-icon name="equalizer" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Type</q-item-label>
                            <q-item-label caption>{{
                                sound.type
                            }}</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-separator spaced />
                    <q-item>
                        <q-item-section avatar>
                            <q-btn
                                unelevated
                                round
                                dense
                                icon="play_arrow"
                                color="primary"
                                @click="onSoundPlay(sound.id)"
                            />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Play this sound!</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script>
import moment from 'moment'

export default {
    name: 'SoundInfoDialog',
    components: {},
    data() {
        return {
            sound: undefined,
            user: undefined,
        }
    },
    created() {
        this.moment = moment
    },
    mounted() {
        this.bus.on('onSoundInfoClick', (params) => {
            this.sound = params.sound
            this.user = params.user
        })
    },
    methods: {
        onSoundPlay: async function (id) {
            await this.$store.dispatch('player/playRemoteSound', { id })
        },
    },
}
</script>

<style></style>
