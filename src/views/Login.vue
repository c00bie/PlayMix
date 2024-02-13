<script setup lang="ts">
import useStore from '../store'
import axios from 'axios'
import { ref } from 'vue';
import { strictEqual } from 'assert';
import { useRouter } from 'vue-router';
import SpotifyWebApi from 'spotify-web-api-js'

function generateRandomString(length: number) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier: string) {
  function base64encode(string: ArrayBuffer) { //@ts-ignore
    return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);

  return base64encode(digest);
}

const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const error = urlParams.get('error');
const store = useStore()
const state = ref('Logging in with Spotify...')
const isError = ref(false)
const redirect = location.origin + '/login'
const router = useRouter()
const scopes = [
  'playlist-read-collaborative',
  'playlist-read-private',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-library-read',
  'streaming',
  'user-modify-playback-state',
  'user-read-playback-state',
  'user-read-currently-playing'
]

if (code === null){
  let codeVerifier = generateRandomString(128);
  localStorage.setItem('code_verifier', codeVerifier);
  generateCodeChallenge(codeVerifier).then(codeChallenge => {
    window.location.href = `https://accounts.spotify.com/authorize/?client_id=${import.meta.env.VITE_CLIENT_ID}&response_type=code&scope=${scopes.join(' ')}&redirect_uri=${redirect}&code_challenge_method=S256&code_challenge=${codeChallenge}`
  })
}
else if (error !== null) {

}
else {
  const codeVerifier = localStorage.getItem('code_verifier')
  state.value = "Retrieving access token..."
  const params = new URLSearchParams()
  params.append('grant_type', 'authorization_code')
  params.append('code', code)
  params.append('redirect_uri', redirect)
  params.append('code_verifier', codeVerifier as string)
  params.append('client_id', import.meta.env.VITE_CLIENT_ID)
  axios.post('https://accounts.spotify.com/api/token', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => {
    state.value = "Retrieving user information..."
    store.authToken = res.data.access_token
    store.refreshToken = res.data.refresh_token
    store.refreshAfter = res.data.expires_in
    store.api = new SpotifyWebApi()
    store.api.setAccessToken(store.authToken)
    store.api.getMe().then(res => {
      store.userID = res.id
    })
    state.value = "Creating player..."
    store.player = new Spotify.Player({
      name: 'PlayMix',
      getOAuthToken: (cb) => {
        cb(store.authToken)
      }
    })
    localStorage.removeItem('code_verifier')
    store.player?.on('ready', ({ device_id }) => {
      store.deviceId = device_id
      console.log('Connected with Device ID', device_id);
      router.push('/select')
      // @ts-ignore
      store.player?.activateElement()
    });
    setTimeout(store.renewToken, store.refreshAfter * 900)
    store.player?.connect()
  }).catch(err => {
    console.log(err)
    state.value = "Error: " + err.response.data.error
    isError.value = true
  })
}

function retry() {
  window.location.href = redirect
}
</script>

<template>
<n-space justify="center" align="center" style="height: 100vh" vertical>
  <h1>{{ state }}</h1>
  <n-button round type="primary" v-if="isError" @click="retry">Try again</n-button>
  <n-spin v-else></n-spin>
</n-space>
</template>
