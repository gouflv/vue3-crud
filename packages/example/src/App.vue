<template>
  <div style="">
    <nav style="padding: 32px; background: #eee">
      <div>
        <router-link to="/useListStore">useListStore</router-link>
      </div>
      <div>
        <router-link to="/useEditStore">useEditStore</router-link>
      </div>
      <div>
        <router-link to="/useModalStore">useModalStore</router-link>
      </div>
      <div>
        <router-link to="/useEditModalStore">useEditModalStore</router-link>
      </div>
      <div>
        <router-link to="/ListAndEdit">Combine List And Edit</router-link>
      </div>
      <div>
        <router-link to="/useRemoveStore">useRemoveStore</router-link>
      </div>
    </nav>
    <div style="padding: 32px">
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
