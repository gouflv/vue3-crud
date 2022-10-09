<template>
  <div>FormData: {{ data }}</div>

  <form @submit.prevent="actions.onSubmit">
    <input type="text" v-model="data.name" />
    <button>Submit</button>
  </form>
</template>

<script setup lang="ts">
import { injectEditStore } from '@vue3-crud/core'

const { data, actions } = injectEditStore()
</script>
