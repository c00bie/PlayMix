<script setup lang="ts">
import useStore from '../store'
import axios from 'axios'
import { ref } from 'vue';
import { strictEqual } from 'assert';
import { useRouter } from 'vue-router';
import SpotifyWebApi from 'spotify-web-api-js'

const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const error = urlParams.get('error');
const store = useStore()
const state = ref('Logging in with Spotify...')
const redirect = location.origin + '/login'
const router = useRouter()
const scopes = [
  'playlist-read-collaborative',
  'playlist-read-private',
  'user-library-read',
  'streaming',
  'user-modify-playback-state',
  'user-read-playback-state',
  'user-read-currently-playing'
]

if (code === null)
  window.location.href = `https://accounts.spotify.com/authorize/?client_id=65669c1dd2ab4fb2a8e77754832fe49f&response_type=code&scope=${scopes.join(' ')}&redirect_uri=${redirect}`
else if (error !== null) {

}
else {
  state.value = "Retrieving access token..."
  const params = new URLSearchParams()
  params.append('grant_type', 'authorization_code')
  params.append('code', code)
  params.append('redirect_uri', redirect)
  axios.post('https://accounts.spotify.com/api/token', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + import.meta.env.VITE_AUTH
    }
  }).then(res => {
    state.value = "Retrieving user information..."
    console.log(res)
    store.authToken = res.data.access_token
    store.refreshToken = res.data.refresh_token
    store.refreshAfter = res.data.expires_in
    store.api = new SpotifyWebApi()
    store.api.setAccessToken(store.authToken)
    state.value = "Creating player..."
    store.player = new Spotify.Player({
      name: 'SpotiShuffle',
      getOAuthToken: (cb) => {
        cb(store.authToken)
      }
    })
    store.player?.on('ready', ({ device_id }) => {
      store.deviceId = device_id
      console.log('Connected with Device ID', device_id);
      router.push('/select')
      // @ts-ignore
      store.player?.activateElement()
    });
    store.player?.connect()
  }).catch(err => {
    console.log(err)
    state.value = "Error: " + err.response.data.error
  })
}

</script>

<template>
<n-space justify="center" align="center" style="height: 100vh" vertical>
  <h1>{{ state }}</h1>
  <n-spin></n-spin>
</n-space>
</template>