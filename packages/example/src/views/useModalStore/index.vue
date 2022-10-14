<template>
  <p>
    <button @click="actions.open">Open</button>
  </p>
  <p>visible: {{ visible }}</p>
  <div v-if="visible">
    Modal Open
    <a @click="actions.close">close</a>
  </div>
</template>

<script setup lang="ts">
import { useModalStore } from '@vue3-crud/core'

const { visible, actions } = useModalStore()
</script>
