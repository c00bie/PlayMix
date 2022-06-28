<script setup lang="ts">
import { computed, ref, watch, h } from 'vue';
import useStore, { convertUri } from '../store'
import { average } from 'color.js'
import Color from 'color';
import { format } from 'date-fns';
import { Play, Pause, StepBackward, StepForward } from '@vicons/fa'
import { SpeakerFilled, PlaylistAddFilled } from '@vicons/material'
import { useRouter } from 'vue-router';
import { NSpin, useNotification } from 'naive-ui';
import type { DropdownMixedOption } from 'naive-ui/es/dropdown/src/interface';

const store = useStore()
const router = useRouter()
const notif = useNotification()
const playerState = ref<Spotify.PlaybackState | null>(null)
const position = ref(-1)
const duration = computed(() => playerState.value?.duration ?? 0)
const playing = computed(() => playerState.value?.paused !== true)
var lastUpdate = Date.now()
const currentTrack = computed(() => playerState.value?.track_window.current_track ?? null) //ref<Spotify.Track | null>(null)
const lists = computed(() => {
  if (currentTrack.value !== null && store.playlistMap[currentTrack.value.uri] !== undefined)
    return store.playlistMap[currentTrack.value.uri]
  else return []
})

const devices = ref<SpotifyApi.UserDevice[] | null>(null)
const devOptions = computed<DropdownMixedOption[]>(() => {
  if (devices.value === null)
    return [
      {
        type: 'render',
        key: 'load',
        render: () => h(NSpin)
      }
    ]
  else
    return devices.value.map(dev => ({
      key: dev.id ?? '',
      label: dev.name,
      props: {
        style: {
          fontWeight: dev.is_active ? 'bold' : 'normal'
        }
      }
    }))
})
function updateDevices() {
  devices.value = null
  store.api?.getMyDevices().then(dev => {
    devices.value = dev.devices.sort((a) => a.is_active ? -1 : 1)
  }).catch(() => error('Failed to get devices'))
}
function changeDevice(id: string) {
  if (id !== store.deviceId)
    store.api?.transferMyPlayback([id]).then(() => success('Playback transferred!'))
      .catch(() =>error('Failed to transfer playback'))
}

watch(currentTrack, (track, oldTrack) => {
  if (router.currentRoute.value.name !== 'player') return
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
  if (router.currentRoute.value.name !== 'player') return
  if (lastStateUpdate + 500 > Date.now())
    return
  if (state?.repeat_mode === 0)
    await store.api?.setRepeat('context').catch(() => { })
  if (state?.shuffle !== true)
    await store.api?.setShuffle(true).catch(() => { })
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
var int = setInterval(() => {
  if (playing.value)
    position.value += (Date.now() - lastUpdate)
  lastUpdate = Date.now()
}, 250);

function seek(position: number) {
  if (playerState.value?.disallows.seeking !== true)
    store.player?.seek(position)
}

function reselect() {
  clearInterval(int)
  requestAnimationFrame(() => {
    router.push('/select')
  })
}

function saveToPlaylist() {
  const playlists = [...new Set(Object.values(store.playlistMap).flat(1))]
  store.api?.getMe().then(me => {
    store.api?.createPlaylist(me.id, {
      name: 'My PlayMix list',
      description: 'Playlist created by PlayMix, consisting of: "' + playlists.map(p => p.name).join('", "') + '"'
    }).then(async (playlist) => {
      try {
      for (var i = 0; i < store.playlist.length; i += 100)
        await store.api?.addTracksToPlaylist(playlist.id, store.playlist.slice(i, i + 100))
      success('Playlist created!')
      }
      catch (e) {
        error('Failed to add tracks to playlist')
      }
    }).catch(() => error('Failed to create playlist'))
  }).catch(() => error('Failed to get user info'))
}

function success(title: string) {
  return notif.success({
    title,
    duration: 5000,
    closable: true
  })
}

function error(title: string) {
  return notif.error({
    title,
    duration: 5000,
    closable: true
  })
}
</script>

<template>
  <div id="return">
    <n-button type="primary" round size="large" @click="reselect">Return to selection</n-button>
  </div>
  <n-space id="player" vertical align="center" justify="center">
    <div v-if="currentTrack === null" style="text-align: center">
      <n-h2>Player is inactive</n-h2>
      <n-p>Playback was probably transferred to another device</n-p>
    </div>
    <n-space v-else id="player-content" align="center">
      <a :href="convertUri(currentTrack?.album.uri)" target="_blank"><img id="currentCover" :src="currentTrack?.album.images[0].url" :alt="currentTrack?.album.name"></a>
      <div id="currentSong">
        <n-space id="title" align="start" justify="space-between" :wrap="false">
          <h2><a :href="convertUri(currentTrack?.uri)" target="_blank">{{ currentTrack?.name || 'Unknown track' }}</a></h2>
          <img id="spotifyLogo" src="../assets/Spotify_green.svg" alt="Spotify">
        </n-space>
        <n-h3 id="artists" style="margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          <n-text v-for="art of currentTrack.artists" depth="3">
            <a :href="convertUri(art.uri)" target="_blank">{{ art.name }}</a>
          </n-text>
        </n-h3>
        <n-p id="playlists" depth="3" style="margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          <span>From: </span>
          <n-text v-for="list of lists" depth="3">
            <a :href="list.url" target="_blank">{{list.name}}</a>
          </n-text>
        </n-p>
        <div id="controls">
          <n-slider :show-tooltip="false" :format-tooltip="() => ''" :value="position" :max="duration"
            :on-update:value="seek"></n-slider>
          <n-space style="font-size: 0.9em" justify="space-between" :wrap="false">
            <n-text depth="3">{{ format(new Date(position), 'm:ss') }}</n-text>
            <n-text depth="3">{{ format(new Date(duration), 'm:ss') }}</n-text>
          </n-space>
          <n-space align="center" justify="space-between">
            <n-dropdown :options="devOptions" @select="changeDevice" trigger="click">
                <n-button @click="updateDevices" :disabled="!currentTrack" circle type="primary" size="small">
                <template #icon>
                  <n-icon>
                    <SpeakerFilled />
                  </n-icon>
                </template>
              </n-button>
            </n-dropdown>
            <n-space justify="center" align="center">
              <n-button @click="store.player?.previousTrack()" :disabled="!currentTrack" circle type="primary">
                <template #icon>
                  <n-icon>
                    <StepBackward />
                  </n-icon>
                </template>
              </n-button>
              <n-button @click="store.player?.togglePlay()" :disabled="!currentTrack" circle size="large"
                type="primary">
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
            <n-button @click="saveToPlaylist" :disabled="!currentTrack" circle type="primary" size="small">
                <template #icon>
                  <n-icon>
                    <PlaylistAddFilled />
                  </n-icon>
                </template>
              </n-button>
          </n-space>
          <p>
            <n-text depth="3" style="margin-top: 20px; font-size: 0.9em; text-align: center;">
            You can also control playback using Spotify Connect
            </n-text>
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
    >div {
      flex-grow: 1;

      &:first-child {
        text-align: center;
      }
    }

    #artists, #playlists {
      .n-text:not(:last-child) {
        a::after {
          content: ', ';
        }
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

#return {
  position: fixed;
  top: 10px;
  left: 10px;
}
</style>