<template>
  <div>Data: {{ data }}</div>
  <div>
    Items:
    <ul>
      <li v-for="(item, i) in data.items" :key="i">
        {{ item.name }}
      </li>
    </ul>
  </div>
  <div>Loading: {{ loading }}</div>
  <div>Pagination: {{ pagination }}, index: {{ pagination.page }}</div>
  <div>Search: {{ search }}, name: {{ search.name }}</div>
  <div>
    <button @click="pageNext">Page next</button>
    <button @click="onSearch">Search submit</button>
  </div>

  <Edit />
</template>

<script setup lang="ts">
import { createListStore } from '@vue3-crud/core'
import Edit from './edit.vue'

const { data, loading, pagination, search, actions } = createListStore({
  url: 'mock/users'
})

// actions.fetch()

function pageNext() {
  actions.setPagination((val) => ({ page: val.page + 1 }))
}

function onSearch() {
  actions.setSearch({ name: 'test' })
}
</script>
