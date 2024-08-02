<template>
  <q-toolbar class="bg-dark row footer shadow-1 q-py-md">
    <div class="col-auto row items-center">
      <q-avatar
          :color="playingColor"
          @click="onPlayedSoundIconClicked"
          style="cursor: pointer"
      >
        <q-spinner
            v-if="isSoundLoading"
            :color="playingTextColor"
            size="1em"
        />
        <q-spinner-audio
            v-else-if="playing"
            :color="playingTextColor"
            size="1em"
        />
        <q-icon
            v-else
            :name="notPlayingIcon"
            :color="playingTextColor"
        />
      </q-avatar>
      <div class="column q-mx-md">
        <div class="text-bold audio-player-sound-name">
          {{ soundName }}
        </div>
        <div v-if="playedBy">
          <div>
            <q-icon :name="sourceIcon"/>
            <span class="text-caption q-ml-sm">{{
                playedBy.displayName
              }}</span>
          </div>
          <div>
            <q-icon name="schedule"/>
            <span class="text-caption q-ml-sm">{{
                soundDate
              }}</span>
          </div>
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
    <q-space/>
    <recently-played/>
    <q-btn
        round
        unelevated
        flat
        color="purple"
        icon="casino"
        @click="onPlayRandomSoundClicked"
    >
      <q-tooltip class="bg-grey-9" :delay="500" :offset="[0, 10]"
      >Play random sound
      </q-tooltip
      >
    </q-btn>
    <volume-control/>
  </q-toolbar>
</template>

<script>
import {mapGetters, mapState} from 'vuex'
import {Howl} from 'howler'
import moment from 'moment'
import RecentlyPlayed from './RecentlyPlayed'
import VolumeControl from '../components/VolumeControl'

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
    }
  },
  computed: {
    ...mapGetters('user', ['selfMute']),
    ...mapState({
      isSoundLoading: (state) => state.player.isSoundLoading,
      volume: (state) => state.player.volume / 100,
      soundName: (state) => {
        if (state.player.playedSound) {
          const sound = state.sound.sounds.filter(
              (sound) => sound.id === state.player.playedSound.soundId
          )[0]
          if (sound) {
            return sound.name
          }
        }
        return 'Crickets are zirping'
      },
      soundId: (state) => {
        if (state.player.playedSound) {
          const sound = state.sound.sounds.filter(
              (sound) => sound.id === state.player.playedSound.soundId
          )[0]
          if (sound) {
            return sound.id
          }
        }
      },
      favorite: (state) => {
        if (state.player.playedSound) {
          const sound = state.sound.sounds.filter(
              (sound) => sound.id === state.player.playedSound.soundId
          )[0]
          if (sound) {
            return state.sound.favoriteSoundIds.includes(sound.id)
          }
        }
        return false
      },
      soundDate: (state) => {
        if (state.player.playedSound) {
          return moment(state.player.playedSound.timestamp).format(
              'LTS'
          )
        }
        return moment().format('LTS')
      },
      playedBy: (state) => {
        if (state.player.playedSound) {
          const playerFilter = state.user.boardUsers.filter(
              (u) => u.id === state.player.playedSound.playedBy
          )
          if (playerFilter.length > 0) {
            return playerFilter[0]
          } else {
            return {
              displayName: 'API',
            }
          }
        } else {
          return {displayName: 'Mr. Cricket'}
        }
      },
      sourceIcon: function (state) {
        if (!state.player.playedSound) return 'person'
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
            return 'person'
        }
      },
      playedSound: (state) => state.player.playedSound,
      playingColor: function (state) {
        if (!this.playing) {
          return 'white'
        }
        return state.player.playedSound.random ? 'purple' : 'primary'
      },
      playingTextColor: function () {
        if (!this.playing) {
          return 'primary'
        }
        return 'white'
      },
      playingIcon: (state) =>
          state.player.playedSound && state.player.playedSound.random
              ? 'casino'
              : 'graphic_eq',
      notPlayingIcon: (state) =>
          state.player.playedSound ? 'play_arrow' : 'casino',
    }),
  },
  watch: {
    volume(val) {
      if (this.audio) {
        this.audio.volume(val)
      }
    },
    selfMute(val) {
      this.$store.dispatch('user/onSelfMuteToggle', {selfMute: val})
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
          this.$store.dispatch('player/toggleSoundPlaying', true)
          this.playing = true
        },
        onstop: () => {
          this.$store.dispatch('player/toggleSoundPlaying', false)
          this.playing = false
        },
        onend: () => {
          this.$store.dispatch('player/toggleSoundPlaying', false)
          this.playing = false
        },
      })
      this.audio.play()
    },
  },
  methods: {
    onFavoriteToggle: async function (id) {
      await this.$store.dispatch('sound/toggleFavoriteSound', {id})
    },
    stopAudioPlaying() {
      if (this.audio) {
        this.audio.stop()
        this.audio.unload()
        this.audio = undefined
      }
    },
    onPlayedSoundIconClicked() {
      if (this.playing) return

      if (!this.playedSound) {
        this.$store.dispatch('player/playRandomSound')
      } else {
        this.$store.dispatch('player/playRemoteSound', {
          id: this.playedSound.soundId,
        })
      }
    },
    onPlayRandomSoundClicked() {
      this.$store.dispatch('player/playRandomSound')
    },
  },
}
</script>

<style></style>
