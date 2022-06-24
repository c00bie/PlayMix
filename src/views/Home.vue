<script setup lang="ts">
import { userInfo } from 'os';
import { useRouter } from 'vue-router';

const router = useRouter()
</script>

<template>
<div id="top">
  <p class="header">Play your library on shuffle</p>
  <p class="subheader">SpotiShuffle lets you mix your playlists together - without making mess in your library</p>
  <n-button type="primary" round size="large" @click="router.push('/login')">Let's rock!</n-button>
  <n-p depth="3" style="margin-top: -5px; font-style: italic">Spotify Premium required</n-p>
  <p id="spotify">
    <span>Powered by</span>
    <img src="../assets/Spotify_green.svg" alt="Spotify" />
  </p>
</div>
</template>

<style lang="scss">
#top {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 10px;
  font-size: 1.25rem;
  position: relative;

  #spotify {
    text-align: right;
    position: absolute;
    bottom: 10px;
    right: 10px;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: nowrap;

    img {
      width: 100px;
    }
  }
}
</style>