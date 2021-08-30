<template>
    <q-toolbar class="bg-dark row footer shadow-1 q-py-md">
        <div class="col-auto row">
            <q-avatar :color="playingColor">
                <q-spinner v-if="isSoundLoading" color="white" size="1em" />
                <q-spinner-audio v-else-if="playing" color="white" size="1em" />
                <q-icon v-else name="mode_night" />
            </q-avatar>
            <div class="column q-mx-md">
                <div class="text-bold audio-player-sound-name">
                    {{ soundName }}
                </div>
                <div v-if="playedBy" class="text-caption">
                    {{ playedBy.displayName }} <q-icon :name="sourceIcon" /> ({{
                        soundDate
                    }})
                </div>
            </div>
            <div class="column justify-center">
                <q-btn
                    v-if="soundId !== undefined"
                    unelevated
                    flat
                    round
                    :icon="favorite ? 'favorite' : 'favorite_border'"
                    color="red"
                    @click="onFavoriteToggle(soundId)"
                />
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
                style="max-width: 350px;"
            />
            <div class="text-caption">{{ audioLengthSecondsFormatted }}</div>
        </div>
        <recently-played />
        <q-btn
            round
            unelevated
            flat
            color="purple"
            icon="casino"
            @click="onPlayRandomSoundClicked"
        />
        <volume-control />
    </q-toolbar>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { Howl } from 'howler'
import moment from 'moment'
import RecentlyPlayed from './RecentlyPlayed.vue'
import VolumeControl from '../components/VolumeControl.vue'

export default {
    name: 'Player',
    components: {
        RecentlyPlayed,
        VolumeControl,
    },
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
    computed: {
        ...mapGetters('user', ['selfMute']),
        ...mapState({
            isSoundLoading: state => state.player.isSoundLoading,
            volume: state => state.player.volume / 100,
            soundName: state => {
                if (state.player.playedSound) {
                    const sound = state.sound.sounds.filter(
                        sound => sound.id === state.player.playedSound.soundId
                    )[0]
                    if (sound) {
                        return sound.name
                    }
                }
                return 'Crickets are zirping.mp3'
            },
            soundId: state => {
                if (state.player.playedSound) {
                    const sound = state.sound.sounds.filter(
                        sound => sound.id === state.player.playedSound.soundId
                    )[0]
                    if (sound) {
                        return sound.id
                    }
                }
            },
            favorite: state => {
                if (state.player.playedSound) {
                    const sound = state.sound.sounds.filter(
                        sound => sound.id === state.player.playedSound.soundId
                    )[0]
                    if (sound) {
                        return state.sound.favoriteSoundIds.includes(sound.id)
                    }
                }
                return 'Crickets are zirping.mp3'
            },
            soundDate: state => {
                if (state.player.playedSound) {
                    return moment(state.player.playedSound.timestamp).format(
                        'LTS'
                    )
                }
                return moment().format('LTS')
            },
            playedBy: state => {
                if (state.player.playedSound) {
                    const playerFilter = state.user.boardUsers.filter(
                        u => u.id === state.player.playedSound.playedBy
                    )
                    if (playerFilter.length > 0) {
                        return playerFilter[0]
                    } else {
                        return {
                            displayName: 'API',
                        }
                    }
                } else {
                    return { displayName: '*chirp*' }
                }
            },
            sourceIcon: function(state) {
                if (!state.player.playedSound) return ''
                switch (state.player.playedSound.source) {
                    case 'web':
                        return 'web'
                    case 'desktop':
                        return 'desktop_windows'
                    case 'hardware':
                        return 'memory'
                    case 'api':
                        return 'code'
                    default:
                        return ''
                }
            },
            playedSound: state => state.player.playedSound,
            playingColor: function(state) {
                if (!this.playing) {
                    return 'grey'
                }
                return state.player.playedSound.random ? 'purple' : 'primary'
            },
            playingIcon: state =>
                state.player.playedSound && state.player.playedSound.random
                    ? 'casino'
                    : 'graphic_eq',
        }),
    },
    watch: {
        volume(val) {
            if (this.audio) {
                this.audio.volume(val)
            }
        },
        selfMute(val) {
            this.$store.dispatch('user/onSelfMuteToggle', { selfMute: val })
            if (val) {
                this.stopAudioPlaying()
            }
        },
        playedSound(val) {
            if (val.skip) return

            this.stopAudioPlaying()
            this.audio = new Howl({
                src: [val.soundUrl],
                format: ['mp3'],
                volume: this.volume,
                onplay: () => {
                    this.$store.dispatch('player/toggleSoundLoading', false)
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
    },
    methods: {
        onFavoriteToggle: async function(id) {
            await this.$store.dispatch('sound/toggleFavoriteSound', { id })
        },
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
            this.$store.dispatch('player/playRandomSound')
        },
    },
}
</script>

<style></style>
