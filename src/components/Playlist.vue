<script setup lang="ts">
import useStore, { pickTextColor } from '../store'
import { CheckCircle } from '@vicons/fa'
import { ref, computed } from 'vue';
import { average } from 'color.js'
import Color from 'color';

const store = useStore()
const props = defineProps<{
  playlist: SpotifyApi.PlaylistObjectSimplified,
  checked: boolean
}>()
const emit = defineEmits<{
  (event: 'checked', newState: boolean): boolean
}>()
var overlay = ref(store.darkColor)
average(props.playlist.images[0].url).then(res => {
  overlay.value = Color(res).hex()
})
const checked = computed({
  get: () => props.checked,
  set: (value) => emit('checked', value)
})
const text = computed(() => {
  if (!checked.value)
    return '#fff'
  else
    return pickTextColor(overlay.value, '#fff', '#000')
})
</script>

<template>
<n-space class="playlist" vertical align="center" :style="{'--ss-checked-color': overlay, '--ss-checked-text': text}" :data-checked="checked">
  <div class="cover" @click="checked = !checked">
    <img :src="playlist.images[0].url" loading="lazy">
    <!-- <div class="cover-checked" :data-checked="checked">
      <n-icon :color="overlay" size="45px">
        <CheckCircle />
      </n-icon>
    </div> -->
  </div>
  <div class="playlistInfo">
    <p><a :href="playlist.external_urls.spotify" target="_blank">{{ playlist.name }}</a></p>
    <p>{{ playlist.tracks.total }} tracks</p>
  </div>
</n-space>
</template>

<style lang="scss">
$coversize: 150px;

.n-space.playlist {
  padding: 10px;
  background-color: transparent;
  color: var(--ss-checked-text);
  transition: background-color 0.2s ease-in-out;
  border-radius: 5px;
  height: calc(100% - 20px);

  &[data-checked="true"] {
    background-color: var(--ss-checked-color, transparent);
  }
}

.cover {
  width: $coversize;
  height: $coversize;
  position: relative;
  transform: scale(1);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: pointer;
  }

  .cover-checked {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    &[data-checked="true"] {
      &::before {
        opacity: 0.75;
      }

      i {
        opacity: 1;
      }
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
      background: black;//var(--ss-base-color, white);
    }

    i {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
    }
  }
}

.playlistInfo {
  max-width: $coversize;
  text-align: center;

  p {
    margin: 0;

    &:nth-child(1) {
      font-weight: bold;
      font-size: 1.1rem;
    }

    &:nth-child(2) {
      font-size: 0.9rem;
      font-style: italic;
    }
  }
}
</style>