<script setup lang="ts">
import Playlist from '../components/Playlist.vue'
import useStore from '../store'
import { ref } from 'vue';
import { ArrowsShuffle } from '@vicons/tabler';
import { useRouter } from 'vue-router';
import type { State } from '../store';

const store = useStore()
const router = useRouter()
var playlists = ref<SpotifyApi.PlaylistObjectSimplified[]>([])
store.getPlaylists().then(res => {
  playlists.value = res
})
const message = ref('')
const first = store.playlist.length === 0

function updateChecked(id: string, state: boolean) {
  const i = store.selectedPlaylists.indexOf(id)
  if (i === -1 && state)
    store.selectedPlaylists.push(id)
  else if (i !== -1 && !state)
    store.selectedPlaylists.splice(i, 1)
}

async function shuffle() {
  message.value = 'Preparing to shuffle...'
  var tracks: string[] = [];
  var listnames: { [key: string]: State['playlistMap'][string][0] } = {}
  message.value = 'Mapping playlists...'
  for (const list of playlists.value) {
    if (store.selectedPlaylists.includes(list.id)) {
      listnames[list.id] = {
        url: list.external_urls.spotify,
        name: list.name
      }
    }
  }
  store.playlistMap = {}
  for (const list of store.selectedPlaylists) {
    message.value = 'Retrieving tracks from ' + listnames[list].name + '...'
    var tr: string[] = [];
    var offset = 0;
    do {
      var rq = await store.api?.getPlaylistTracks(list, { offset: offset, limit: 50 });
      if (rq === undefined) break;
      tr.push(...rq.items.map(i => i.track.uri))
      offset += 50;
    } while (rq?.total > tr.length)
    for (const track of tr) {
      if (store.playlistMap[track] === undefined)
        store.playlistMap[track] = [listnames[list]]
      else
        store.playlistMap[track].push(listnames[list])
    }
    tracks.push(...tr)
  }
  message.value = 'Shuffling...'
  tracks.sort(() => Math.random() - 0.5)
  message.value = 'Removing duplicates...'
  store.playlist = [...new Set(tracks)]
  message.value = 'Playing...'
  await store.api?.play({
    device_id: store.deviceId,
    uris: store.playlist
  })
  router.push('/player')
}
</script>

<template>
<n-space id="playlistSelect" align="center" justify="center" vertical>
  <p class="header" v-if="first">First things first...</p>
  <p class="header" v-else>Changed your mind?</p>
  <p class="subheader">Select playlists you want to use</p>
  <n-p id="instructions" depth="3" style="font-size: 1.25em">
    Click on cover art to select<br/>
    Click on title to view on Spotify
  </n-p>
  <n-space v-if="playlists.length === 0" vertical align="center" justify="center">
    <n-text>Retrieving playlists...</n-text>
    <n-spin></n-spin>
  </n-space>
  <n-grid cols="1 xs:2 s:3 m:4 l:5 xl:6 xxl:7" responsive="screen" x-gap="10px s:25px" y-gap="25px">
    <n-gi v-for="play of playlists">
      <Playlist :playlist="play" :checked="store.selectedPlaylists.includes(play.id)" @checked="updateChecked(play.id, $event)"></Playlist>
    </n-gi>
  </n-grid>
</n-space>
<n-button @click="shuffle" id="shuffle" round type="primary" size="large" :disabled="store.selectedPlaylists.length == 0">
  <template #icon>
    <n-icon>
      <ArrowsShuffle />
    </n-icon>
  </template>
  Shuffle!
</n-button>
<n-modal :show="message !== ''">
  <n-card size="huge" style="width: 90%; max-width: 600px;">
    <n-space vertical align="center" justify="center">
      <n-h2 style="text-align: center">{{ message }}</n-h2>
      <n-spin></n-spin>
    </n-space>
  </n-card>
</n-modal>
</template>

<style lang="scss">
#playlistSelect {
  min-height: 100vh;
  padding: 50px 10px;
  margin-bottom: 50px;
  text-align: center;

  .n-grid {
    margin-top: 50px;
    position: relative;

    &::before {
      position: absolute;
      top: -50px;
      right: 0;
      content: url('../assets/Spotify_green.svg');
      height: 50px;
      width: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

#shuffle {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90vw;
  max-width: 300px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
}

#spotify-lists {
  text-align: center;
  //position: fixed;
  //bottom: 10px;
  //right: 10px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
  font-size: 1.25em;

  img {
    width: 100px;
  }
}
</style>