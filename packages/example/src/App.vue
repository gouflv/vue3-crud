<template>
  <div>
    <h2>Simple</h2>
    <Simple />
  </div>
</template>

<script setup lang="ts">
import { ConfigProvider, RequestService } from '@vue3-crud/core'
import Simple from './views/simple/index.vue'
import axios from 'axios'
import { mockAxios } from './axios-mock'

mockAxios(axios)

ConfigProvider.set({
  requestService: new RequestService()
})
</script>
