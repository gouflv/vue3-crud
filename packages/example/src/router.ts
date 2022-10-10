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
      path: '/useEditModalStore',
      component: () => import('./views/useEditModalStore/index.vue')
    },
    {
      path: '/ListAndEdit',
      component: () => import('./views/ListAndEdit/index.vue')
    },
    {
      path: '/useRemoveStore',
      component: () => import('./views/useRemoveStore/index.vue')
    },
    {
      path: '/antd-simple',
      component: () => import('./views/AntdSimple/index.vue')
    }
  ]
})

export default router
