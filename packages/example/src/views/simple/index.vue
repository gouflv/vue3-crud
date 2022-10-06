<template>
  <h2>List</h2>
  <div>Initial: {{ state.initialParams }}</div>
  <div>Search: {{ state.search }}</div>
  <div>
    Pagination: {{ state.pagination }}, index:
    {{ state.pagination.value?.page }}
  </div>
  <div>Loading: {{ loading }}</div>
  <hr />
  <div>PageData: {{ data }}</div>
  <div>
    Items:
    <ul>
      <li v-for="(item, i) in data.items" :key="i">
        {{ item.name }}
      </li>
    </ul>
  </div>
  <p>
    <button @click="setInitial">Initial params</button>
    <br />
    <button @click="pageNext">Page next</button>
    <br />
    <button @click="onSearch">Search submit</button>
  </p>
  <Edit />
</template>

<script setup lang="ts">
import { createListStore } from '@vue3-crud/core'
import Edit from './edit.vue'

const { data, loading, state, actions } = createListStore({
  url: 'mock/users'
})

// actions.fetch()

function setInitial() {
  actions.setInitialParams({ initValue: 1 })
}

function pageNext() {
  actions.setPagination((val) => ({ page: val.page + 1 }))
}

function onSearch() {
  actions.setSearch({ name: 'test' })
}
</script>
