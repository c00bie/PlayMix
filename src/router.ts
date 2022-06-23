import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import useStore from './store'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    meta: {
      title: 'Home',
      public: true
    },
    component: () => import('./views/Home.vue')
  },
  {
    path: '/select',
    name: 'select',
    meta: {
      title: 'Select playlists'
    },
    component: () => import('./views/SelectPlaylists.vue')
  },
  {
    path: '/player',
    name: 'player',
    meta: {
      title: 'Player'
    },
    component: () => import('./views/Player.vue')
  },
  {
    path: '/login',
    name: 'login',
    meta: {
      title: 'Login',
      public: true
    },
    component: () => import('./views/Login.vue')
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.public !== true) && useStore().authToken === '')
    next('/login')
  else
    next()
})
export default router
