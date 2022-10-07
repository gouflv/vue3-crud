<template>
  <div style="display: flex; min-height: 100vh">
    <nav style="padding: 32px 16px; width: 10rem; background: #eee">
      <div>
        <router-link to="/createListStore">createListStore</router-link>
      </div>
      <div><router-link to="/antd-simple">AntVue</router-link></div>
    </nav>
    <div style="flex: 1; padding: 32px">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ConfigProvider, RequestService } from '@vue3-crud/core'
import axios from 'axios'
import { mockAxios } from './axios-mock'

mockAxios(axios)

ConfigProvider.set({
  requestService: new RequestService()
})
</script>
