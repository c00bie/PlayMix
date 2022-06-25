import { defineStore } from 'pinia'
import type { GlobalThemeOverrides } from 'naive-ui';
import Color from 'color';
import SpotifyWebApi from 'spotify-web-api-js'
import axios from 'axios'

export interface State {
  baseColor: string,
  playerReady: boolean,
  player: Spotify.Player | null,
  api: SpotifyWebApi.SpotifyWebApiJs | null
  authToken: string,
  refreshToken: string,
  refreshAfter: number,
  deviceId: string,
  selectedPlaylists: string[],
  playlist: string[],
  playlistIndex: number,
  addedListeners: boolean,
  playlistMap: { [key: string]: string[] },
}

const store = defineStore('main', {
  state: (): State => {
    return {
      baseColor: '#63E2B7',
      playerReady: false,
      player: null,
      api: null,
      authToken: '',
      refreshToken: '',
      refreshAfter: 3600,
      deviceId: '',
      selectedPlaylists: [],
      playlist: [],
      playlistIndex: 0,
      addedListeners: false,
      playlistMap: {}
    }
  },
  getters: {
    darkColor: (state: State): string => pickTextColor(state.baseColor, '#FFFFFF', '#000000'),
    themeOverrides: (state): GlobalThemeOverrides => {
      const baseColor = Color(state.baseColor);
      const text = pickTextColor(state.baseColor, '#FFFFFF', '#000000')
      return {
        common: {
          fontSize: '16px',
          primaryColor: state.baseColor,
          primaryColorHover: baseColor.l(baseColor.l() + 6).hex(),
          primaryColorPressed: baseColor.l(baseColor.l() - 6).hex()
        },
        Button: {
          textColorTextPrimary: text,
          textColorPressedPrimary: text,
          textColorFocusPrimary: text,
          textColorHoverPrimary: text,
          textColorPrimary: text,
          //textColor: text,
          //textColorHover: text
        },
        Slider: {
          fillColor: state.baseColor,
          fillColorHover: baseColor.l(baseColor.l() + 6).hex(),
        }
      }
    }
  },
  actions: {
    async getPlaylists(): Promise<SpotifyApi.ListOfUsersPlaylistsResponse['items']> {
      if (this.api === null) return []
      var res: SpotifyApi.ListOfUsersPlaylistsResponse['items'] = []
      var offset = 0
      var playlists = await this.api.getUserPlaylists(undefined)
      res = res.concat(playlists.items)
      while (playlists.total > res.length) {
        offset += playlists.items.length
        // @ts-ignore
        playlists = await this.api.getUserPlaylists({ offset: offset })
        res = res.concat(playlists.items)
      }
      console.log(res)
      return res
    },
    async addNextToQueue(): Promise<void> {
      if (this.player === null || this.playlist.length === 0) return
      await this.api?.queue(this.playlist[this.playlistIndex++], {device_id: this.deviceId})
      if (this.playlistIndex >= this.playlist.length) {
        this.playlist.sort(() => Math.random() - 0.5)
        this.playlistIndex = 0
      }
    },
    renewToken() {
      const params = new URLSearchParams()
      params.append('grant_type', 'refresh_token')
      params.append('refresh_token', this.refreshToken)
      axios.post('https://accounts.spotify.com/api/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + import.meta.env.VITE_AUTH
        }
      }).then(res => {
        this.authToken = res.data.access_token
        this.refreshAfter = res.data.expires_in
        this.api?.setAccessToken(this.authToken)
        setTimeout(this.renewToken, this.refreshAfter * 900)
      }).catch(err => {
        console.log(err)
      })
    }
  },
})

export default store

function pickTextColor(bg: string, light: string, dark: string) {
  var color = Color(bg);
  var c = [color.red() / 255, color.green() / 255, color.blue() / 255]
    .map(col => col <= 0.03928 ? col / 12.92 : Math.pow((col + 0.055) / 1.055, 2.4));
  var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
  return (L > 0.179) ? dark : light;
}