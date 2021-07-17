<template>
    <q-toolbar class="bg-dark row footer q-py-md">
        <div class="col-4 row">
            <q-avatar
                :color="playingColor"
                text-color="white"
                :icon="playingIcon"
            />
            <div class="column q-mx-md">
                <div class="text-bold audio-player-sound-name">
                    {{ soundName }}
                </div>
                <div v-if="playedBy" class="text-caption">
                    {{ playedBy.displayName }} [{{ soundDate }}]
                </div>
            </div>
        </div>
        <div class="col-4 row">
            <div class="text-caption">{{ audioLengthCurrentFormatted }}</div>
            <q-linear-progress
                :value="progress"
                :color="
                    playedSound && playedSound.random ? 'purple' : 'primary'
                "
                class="q-mx-sm"
                style="max-width: 350px; margin-top: 7px"
            />
            <div class="text-caption">{{ audioLengthSecondsFormatted }}</div>
        </div>
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
        <q-btn
            dense
            unelevated
            color="purple"
            icon="casino"
            @click="onPlayRandomSoundClicked"
        />
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
            audioLengthCurrentFormatted: '--:--',
            audioLengthSecondsFormatted: '--:--',
            progressInterval: undefined,
        }
    },
    computed: mapState({
            muted: (state) => state.app.selfMute,
            soundName: (state) => {
                if (state.app.playedSound) {
                    const sound = state.app.sounds.filter(
                        (sound) => sound.id === state.app.playedSound.soundId
                    )[0]
                    if (sound) {
                        return sound.name
                    }
                }
                return 'Crickets are zirping.mp3'
            },
            soundDate: (state) => {
                if (state.app.playedSound) {
                    return moment(state.app.playedSound.timestamp).format(
                        'HH:mm:ss'
                    )
                }
                return moment().format('HH:mm:ss')
            },
            playedBy: (state) => {
                return state.app.playedSound
                    ? state.app.boardUsers.filter(
                          (u) => u.id === state.app.playedSound.playedBy
                      )[0]
                    : '*chirp*'
            },
            playedSound: (state) => state.app.playedSound,
            playingColor: function (state) {
                if (!this.playing) {
                    return 'grey'
                }
                return state.app.playedSound.random ? 'purple' : 'primary'
            },
            playingIcon: (state) =>
                state.app.playedSound && state.app.playedSound.random
                    ? 'casino'
                    : 'graphic_eq',
        }),
    watch: {
        playedSound(val) {
            if (this.$store.state.app.selfMute) {
                return
            }
            this.stopAudioPlaying()
            this.audio = new Howl({
                src: [val.soundUrl],
                format: ['mp3'],
                onplay: () => {
                    this.playing = true
                    this.progressInterval = setInterval(() => {
                        this.updateProgress()
                    }, 100)
                },
                onstop: () => {
                    this.playing = false
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
        muted(muted) {
            if (muted) {
                this.stopAudioPlaying()
            }
        },
    },
    methods: {
        formatSecondsToString(seconds) {
            var date = new Date(0)
            date.setSeconds(seconds) // specify value for SECONDS here
            var timeString = date.toISOString().substr(14, 5)
            return timeString
        },
        stopAudioPlaying() {
            if (this.audio) {
                this.audio.stop()
                this.audio.unload()
                this.audio = undefined
            }
        },
        updateProgress() {
            if (this.playing && this.audio) {
                const progress = (
                    this.audio.seek() / this.audio.duration()
                ).toFixed(2)
                this.progress = Number(progress)
                this.audioLengthCurrentFormatted = this.formatSecondsToString(
                    this.audio.seek()
                )
                this.audioLengthSecondsFormatted = this.formatSecondsToString(
                    this.audio.duration()
                )
            }
        },
        onPlayRandomSoundClicked() {
            this.$store.dispatch('app/playRandomSound')
        },
    },
}
</script>

<style></style>
