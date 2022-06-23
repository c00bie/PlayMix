<script setup lang="ts">
import { userInfo } from 'os';
import { useRouter } from 'vue-router';

const router = useRouter()
</script>

<template>
<div id="top">
  <p class="header">Play your library on shuffle</p>
  <p class="subheader">SpotiShuffle mixes your Spotify library together</p>
  <n-button type="primary" round size="large" @click="router.push('/login')">Let's rock!</n-button>
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
}
</style>