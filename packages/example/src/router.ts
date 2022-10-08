import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/useListStore',
      component: () => import('./views/useListStore/index.vue')
    },
    {
      path: '/useEditStore',
      component: () => import('./views/useEditStore/index.vue')
    },
    {
      path: '/antd-simple',
      component: () => import('./views/antd-simple/index.vue')
    }
  ]
})

export default router
