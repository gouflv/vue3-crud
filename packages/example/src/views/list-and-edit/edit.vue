<template>
  <p>FormData: {{ data }}</p>
  <p>Visible: {{ visible }}</p>

  <form v-if="visible" @submit.prevent="actions.onSubmit">
    <input type="text" v-model="data.name" />
    <button>Submit</button>
  </form>
</template>

<script setup lang="ts">
import {
  EditModalStoreInjectionKey,
  UseEditModalStoreReturn,
  useInjection
} from '@vue3-crud/core'

const { visible, data, actions } = useInjection<UseEditModalStoreReturn>(
  EditModalStoreInjectionKey
)
</script>
