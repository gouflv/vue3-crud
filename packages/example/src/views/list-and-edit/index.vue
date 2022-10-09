<template>
  <div>
    List:
    <ul>
      <li v-for="it in list.data.items">
        {{ it.name }} - <a @click="() => edit.onEdit(it)">edit</a>
      </li>
    </ul>
  </div>
  <div>Loading: {{ list.loading }}</div>
  <hr />
  <Edit />
</template>

<script setup lang="ts">
import { useEditStore, useListStore } from '@vue3-crud/core'
import { reactive } from 'vue'
import Edit from './edit.vue'

const list = reactive(
  useListStore({
    url: 'mock/users'
  })
)

const { actions: edit } = useEditStore({
  submitUrl: ({ data, isEdit }) =>
    isEdit ? `/mock/users/${data.id}` : '/mock/users',
  postSubmit: () => list.actions.fetch()
})
</script>
