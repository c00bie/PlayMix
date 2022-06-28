<script setup lang="ts">
import { computed } from 'vue';
import { useOsTheme, darkTheme, GlobalThemeOverrides } from 'naive-ui';
import useStore from './store'
import { useRouter } from 'vue-router';

const store = useStore()
const router = useRouter()
const theme = computed(() => {
  return useOsTheme().value === 'dark' ? darkTheme : null
})
const breakpoints = { xxs: 0, xs: 420, s: 640, m: 1024, l: 1280, xl: 1536, xxl: 1920 }

// @ts-ignore
window.onSpotifyWebPlaybackSDKReady = () => {
  store.playerReady = true
}

const player = document.createElement('script')
player.src = "https://sdk.scdn.co/spotify-player.js"
document.getElementsByTagName('head')[0].appendChild(player)
</script>

<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="store.themeOverrides" :breakpoints="breakpoints"
    :style="{ '--ss-base-color': store.baseColor, '--ss-base-color-half': store.baseColor + '80', '--ss-base-color-quarter': store.baseColor + '40' }">
      <n-notification-provider :container-style="{ '--ss-base-color': store.baseColor, '--ss-text-color': store.darkColor }">
        <n-layout id="content">
          <router-view></router-view>
        </n-layout>
      </n-notification-provider>
      <n-global-style />
  </n-config-provider>
</template>

<style lang="scss">
#content {
  min-height: 100vh;
}

.header {
  font-size: 3em;
  margin: 0;
  font-weight: bold;
}

.subheader {
  font-size: 1.5em;
  text-align: center;
  margin: 0;
  margin-bottom: 10px;
}

.n-notification-container .n-notification {
  background-color: var(--ss-base-color);

  .n-notification-main * {
    color: var(--ss-text-color) !important;
  }
}

a {
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>