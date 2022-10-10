<template>
  <p>
    <button @click="() => remove({ id: 1 })">Remove</button>
  </p>
  <p>
    {{ loading }}
  </p>
</template>

<script setup lang="ts">
import { useRemoveStore } from '@vue3-crud/core'

const { loading, remove } = useRemoveStore({
  url: ({ params }) => `/api/mock/users/${params.id}`,
  postRequest: () => {
    console.log('remove done')
  }
})
</script>
