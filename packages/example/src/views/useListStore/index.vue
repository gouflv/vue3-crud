<template>
  <h1>useListStore</h1>
  <p>Initial: {{ state.initialParams }}</p>
  <p>Search: {{ state.search }}</p>
  <p>
    Pagination: {{ state.pagination }}, index:
    {{ state.pagination.value?.page }}
  </p>
  <p>Loading: {{ loading }}</p>
  <p>PageData: {{ data }}</p>
  <p>
    Items:
    <ul>
      <li v-for="(item, i) in data.items" :key="i">
        {{ item.name }}
      </li>
    </ul>
  </p>
  <p>
    <button @click="setInitial">Initial params</button>
  </p>
  <p>
    <button @click="onSearch">Search submit</button>
  </p>
  <p>
    <button @click="pageNext">Page next</button>
  </p>
  <Edit />
</template>

<script setup lang="ts">
import { useListStore } from '@vue3-crud/core'

const { data, loading, state, actions } = useListStore({
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
