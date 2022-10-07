import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/createListStore',
      component: () => import('./views/createListStore/index.vue')
    },
    {
      path: '/antd-simple',
      component: () => import('./views/antd-simple/index.vue')
    }
  ]
})

export default router
