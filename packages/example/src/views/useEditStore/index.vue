<template>
  <h1>useEditStore</h1>
  <p>Initial: {{ initialParams }}</p>
  <p>Action Params: {{ actionParams }}</p>
  <p>Loading: {{ loading }}</p>
  <p>Saving: {{ saving }}</p>
  <p>FromData: {{ data }}</p>
  <p>
    <button @click="actions.onAdd({ name: 'foo' })">Add</button>
  </p>
  <p>
    <button @click="actions.onEdit({ id: 1, name: 'zoo' })">Edit</button>
  </p>
  <form @submit.prevent="actions.onSubmit">
    <input type="text" v-model="data.name" />
    <button>Submit</button>
  </form>
</template>

<script setup lang="ts">
import { useEditStore } from '@vue3-crud/core'

const { data, loading, saving, initialParams, actionParams, actions } =
  useEditStore({
    defaultFormData: ({ actionParams }) => actionParams,
    fetchUrl: ({ actionParams }) => `mock/users/${actionParams.id}`,
    submitUrl: ({ data, isEdit }) =>
      isEdit ? `/mock/users/${data.id}` : '/mock/users'
  })
</script>
