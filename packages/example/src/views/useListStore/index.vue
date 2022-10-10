<template>
  <h1>useListStore</h1>
  <p>Initial: {{ initialParams }}</p>
  <p>Search: {{ search }} - {{ search.name }}</p>
  <p>
    Pagination: {{ pagination }}, index:
    {{ pagination.page }}
  </p>
  <p>Loading: {{ loading }}</p>
  <p>PageData: {{ data }}</p>
  <div>
    Items:
    <ul>
      <li v-for="(item, i) in data.items" :key="i">
        {{ item.name }}
      </li>
    </ul>
  </div>
  <p>
    <button @click="setInitial">Update initial params</button>
  </p>
  <p>
    <button @click="onSearch">Search submit</button>
  </p>
  <p>
    <button @click="pageNext">Next Page</button>
  </p>
</template>

<script setup lang="ts">
import { useListStore } from '@vue3-crud/core'

const { data, loading, initialParams, search, pagination, actions } =
  useListStore({
    url: 'mock/users',
    initialParams: { initValue: 0 }
  })

// actions.fetch()

function setInitial() {
  actions.setInitialParams({ initValue: 1 })
}

function onSearch() {
  actions.setSearch({ name: 'test' })
}

function pageNext() {
  actions.setPagination((val) => ({ page: val.page + 1 }))
}
</script>
