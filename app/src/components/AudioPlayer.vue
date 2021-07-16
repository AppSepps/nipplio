<template>
    <q-toolbar class="bg-dark footer q-py-md">
        <q-avatar
            :color="playing ? 'primary' : 'grey'"
            text-color="white"
            icon="graphic_eq"
        />
        <div class="column q-mx-md">
            <div class="text-bold">
                {{ soundName }}
            </div>
            <div class="text-caption">
                {{ playedSound ? playedSound.playedBy : '*zirp*' }}
            </div>
            <div class="text-cation">Played at: {{ soundDate }}</div>
        </div>
        <q-space />
        <div>{{ progress }}</div>
        <q-space />
        <q-item-section avatar>
            <q-btn
                unelevated
                no-caps
                dense
                flat
                icon-right="history"
                label="Recently played"
            >
                <q-menu>
                    <q-list style="min-width: 100px">
                        <q-item clickable v-close-popup>
                            <q-item-section>Sound 1</q-item-section>
                            <q-item-section avatar>
                                <q-icon name="play_arrow" />
                            </q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup>
                            <q-item-section>Sound 2</q-item-section>
                            <q-item-section avatar>
                                <q-icon name="play_arrow" />
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-menu>
            </q-btn>
        </q-item-section>
        <q-btn dense unelevated color="purple" icon="casino" />
    </q-toolbar>
</template>

<script>
import { mapState } from 'vuex'
import { Howl } from 'howler'
import moment from 'moment'

export default {
    name: 'Player',
    components: {},
    data() {
        return {
            audio: undefined,
            playing: false,
            progress: 0.0,
            progressInterval: undefined,
        }
    },
    computed: mapState({
        soundName: state => {
            if (state.app.playedSound) {
                const sound = state.app.sounds.filter(
                    sound => sound.id === state.app.playedSound.soundId
                )[0]
                if (sound) {
                    return sound.name
                }
            }
            return 'Crickets are zirping.mp3'
        },
        soundDate: state => {
            if (state.app.playedSound) {
                return moment(state.app.playedSound.timestamp).format(
                    'HH:mm:ss'
                )
            }
            return moment()
        },
        playedSound: state => state.app.playedSound,
        selfMute: state => state.app.selfMute,
    }),
    watch: {
        selfMute(selfMuted) {
            if (selfMuted && this.audio) {
                this.audio.stop()
                this.audio.unload()
                this.audio = undefined
            }
        },
        playedSound(val) {
            if (this.audio) {
                this.audio.stop()
                this.audio.unload()
                this.audio = undefined
            }
            this.audio = new Howl({
                src: [val.soundUrl],
                format: ['mp3'],
                onplay: () => {
                    this.playing = true
                    this.progressInterval = setInterval(() => {
                        this.updateProgress()
                    }, 200)
                },
                onstop: () => {
                    this.progress = 0.0
                    clearInterval(this.progressInterval)
                },
                onend: () => {
                    this.playing = false
                    this.progress = 1.0
                    clearInterval(this.progressInterval)
                },
            })
            this.audio.play()
        },
    },
    methods: {
        updateProgress() {
            if (this.playing) {
                const progress = (
                    this.audio.seek() / this.audio.duration()
                ).toFixed(2)
                this.progress = progress
            }
        },
    },
}
</script>

<style></style>
