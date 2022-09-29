<template>
  <div>Items: {{ data?.items }}</div>
  <div>Loading: {{ loading }}</div>
  <div>Page: {{ paginationQuery }}</div>
  <div>Search: {{ search }}</div>
  <div>
    <button @click="pageNext">Page next</button>
    <button @click="onSearch">Search submit</button>
  </div>
</template>

<script setup lang="ts">
import { createListStore } from '@vue3-crud/core'

const { data, loading, paginationQuery, search, actions } = createListStore({
  url: 'mock/users'
})

actions.fetch()

function pageNext() {
  actions.setPaginationQuery((val) => ({ page: val.page + 1 }))
}

function onSearch() {
  actions.setSearch({ name: 'test' })
}
</script>
