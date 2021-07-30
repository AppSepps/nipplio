<template>
    <q-toolbar class="bg-dark row footer q-py-md">
        <div class="col-auto row">
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
        <div class="col row flex-center">
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
        <q-item-section avatar>
            <q-btn
                round
                unelevated
                flat
                icon="history"
                :disabled="recentlyPlayed.length === 0"
            >
                <q-menu>
                    <q-list style="min-width: 100px">
                        <q-item
                            v-for="(played, index) in recentlyPlayed"
                            :key="index"
                            clickable
                            v-close-popup
                            @click="onRecentlyPlayedClicked(played.soundId)"
                        >
                            <q-item-section avatar>
                                <q-item-label>
                                    [{{
                                        moment(played.timestamp).format('LTS')
                                    }}]
                                </q-item-label>
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>{{ played.name }}</q-item-label>
                                <q-item-label caption>{{
                                    played.user.displayName
                                }}</q-item-label>
                            </q-item-section>
                            <q-item-section avatar>
                                <q-icon name="play_arrow" />
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-menu>
            </q-btn>
        </q-item-section>
        <q-btn
            round
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
    created() {
        this.moment = moment
    },
    computed: mapState({
        volume: (state) => state.app.volume / 100,
        recentlyPlayed: (state) => state.app.recentlyPlayed,
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
                return moment(state.app.playedSound.timestamp).format('LTS')
            }
            return moment().format('LTS')
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
        volume(val) {
            if (this.audio) {
                this.audio.volume(val)
            }
        },
        playedSound(val) {
            if (this.$store.state.app.selfMute || val.skip) return

            this.stopAudioPlaying()
            this.audio = new Howl({
                src: [val.soundUrl],
                format: ['mp3'],
                volume: this.volume,
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
            const date = new Date(0)
            date.setSeconds(seconds) // specify value for SECONDS here
            const timeString = date.toISOString().substr(14, 5)
            return timeString
        },
        stopAudioPlaying() {
            if (this.audio) {
                this.audio.stop()
                this.audio.unload()
                this.audio = undefined
                this.updateProgress()
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
            } else {
                this.audioLengthSecondsFormatted = '--:--'
                this.audioLengthCurrentFormatted = '--:--'
            }
        },
        onPlayRandomSoundClicked() {
            this.$store.dispatch('app/playRandomSound')
        },
        onRecentlyPlayedClicked(soundId) {
            this.$store.dispatch('app/triggerPlaySound', { id: soundId })
        },
    },
}
</script>

<style></style>
