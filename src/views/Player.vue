<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import useStore from '../store'
import { average } from 'color.js'
import Color from 'color';
import { format } from 'date-fns';
import { Play, Pause, StepBackward, StepForward } from '@vicons/fa'

const store = useStore()
const playerState = ref<Spotify.PlaybackState | null>(null)
const position = ref(-1)
const duration = computed(() => playerState.value?.duration ?? 0)
const playing = computed(() => playerState.value?.paused !== true)
var lastUpdate = Date.now()
const currentTrack = computed(() => playerState.value?.track_window.current_track ?? null) //ref<Spotify.Track | null>(null)
const artists = computed(() => {
  return currentTrack.value?.artists.map(artist => artist.name).join(', ') ?? 'Unknown Artist'
})
const lists = computed(() => {
  return store.playlistMap[currentTrack.value?.uri ?? ''].join(', ') ?? 'unknown'
})

watch(currentTrack, (track, oldTrack) => {
  if (track !== null && track?.id != oldTrack?.id) {
    average(track.album.images[0].url).then(res => {
      store.baseColor = Color(res).hex()
    })
  }
  else if (track === null) {
    position.value = -1
  }
})
var lastStateUpdate = Date.now()
watch(playerState, async (state) => {
  if (lastStateUpdate + 500 > Date.now())
    return
  if (state?.repeat_mode === 0)
    await store.api?.setRepeat('context').catch(() => {})
  if (state?.shuffle !== true)
    await store.api?.setShuffle(true).catch(() => {})
  lastStateUpdate = Date.now()
})

if (!store.addedListeners) {
  store.player?.on('player_state_changed', (state) => {
    playerState.value = state
    position.value = state?.position ?? -1
    lastUpdate = Date.now()
  })
}
store.player?.getCurrentState().then(state => {
  playerState.value = state
  position.value = state?.position ?? -1
  lastUpdate = Date.now()
})
setInterval(() => {
  if (playing.value)
    position.value += (Date.now() - lastUpdate)
  lastUpdate = Date.now()
}, 250);

function seek(position: number) {
  if (playerState.value?.disallows.seeking !== true)
    store.player?.seek(position)
}
</script>

<template>
<n-space id="player" vertical align="center" justify="center">
  <n-space id="player-content" align="center">
      <img id="currentCover" :src="currentTrack?.album.images[0].url" :alt="currentTrack?.album.name">
      <div id="currentSong">
        <n-space id="title" align="start" justify="space-between" :wrap="false">
          <h2>{{ currentTrack?.name || 'Unknown track' }}</h2>
          <img id="spotifyLogo" src="../assets/Spotify_green.svg" alt="Spotify">
        </n-space>
        <n-h3 style="margin: 0">
          <n-text depth="3">{{ artists }}</n-text>
        </n-h3>
        <n-text depth="3">From: {{ lists }}</n-text>
        <div id="controls">
          <n-slider :show-tooltip="false" :format-tooltip="() => ''" :value="position" :max="duration" :on-update:value="seek"></n-slider>
          <n-space style="font-size: 0.9em" justify="space-between" :wrap="false">
            <n-text depth="3">{{ format(new Date(position), 'm:ss') }}</n-text>
            <n-text depth="3">{{ format(new Date(duration), 'm:ss') }}</n-text>
          </n-space>
          <n-space justify="center" align="center">
            <n-button @click="store.player?.previousTrack()" :disabled="!currentTrack" circle type="primary">
              <template #icon>
                <n-icon>
                  <StepBackward />
                </n-icon>
              </template>
            </n-button>
            <n-button @click="store.player?.togglePlay()" :disabled="!currentTrack" circle size="large" type="primary">
              <template #icon>
                <n-icon>
                  <Pause v-if="playing" />
                  <Play v-else />
                </n-icon>
              </template>
            </n-button>
            <n-button @click="store.player?.nextTrack()" :disabled="!currentTrack" circle type="primary">
              <template #icon>
                <n-icon>
                  <StepForward />
                </n-icon>
              </template>
            </n-button>
          </n-space>
          <p>
            <n-text depth="3" style="margin-top: 20px; font-size: 0.9em; text-align: center;">You can also control playback using Spotify Connect</n-text>
          </p>
        </div>
      </div>
  </n-space>
</n-space>
</template>

<style lang="scss">
#player {
  background-color: var(--ss-base-color-quarter);
  transition: background-color 0.2s ease-in-out;
  min-height: 100vh;

  #player-content {
    > div {
      flex-grow: 1;
      &:first-child {
        text-align: center;
      }
    }
  }

  #currentCover {
    width: 250px;
    height: 250px;
    object-fit: cover;
  }

  #currentSong {
    width: calc(100vw - 50px);
    margin: 0 25px;
    margin-top: 25px;

    @media screen and (min-width: 850px) {
      max-width: 500px;
      margin-top: 0;
    }

    #title {
      width: 100%;
      max-width: 100%;

      div:first-child {
        flex-grow: 0;
        max-width: calc(100% - 112px) !important;
      }
    }

    h2 {
      margin: 0;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    #spotifyLogo {
      width: 100px;
      margin-top: 5px;
    }
  }

  #controls {
    margin-top: 30px;
  }
}

.n-slider-handle-indicator {
  display: none;
}
</style>