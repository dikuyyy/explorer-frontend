<!-- src/components/SearchBar.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useExplorerStore } from '@/stores/explorer.store'
import { debounce } from '@/utils/helpers'

const store = useExplorerStore()
const searchInput = ref('')

const debouncedSearch = debounce((query: unknown) => {
  store.search(query as string)
}, 300)

watch(searchInput, (newValue) => {
  if (newValue.trim().length === 0) {
    store.clearSearch()
  } else {
    debouncedSearch(newValue)
  }
})

const clearSearch = () => {
  searchInput.value = ''
  store.clearSearch()
}
</script>

<template>
  <div class="search-bar-wrapper">
    <div class="p-input-icon-left p-input-icon-right w-full">
      <InputText
        v-model="searchInput"
        placeholder="Search files and folders..."
        class="w-full search-input"
        type="text"
      />
      <i v-if="searchInput.length > 0" class="pi pi-times clear-icon" @click="clearSearch" />
    </div>

    <div v-if="store.isSearching && store.loading" class="search-status">
      <ProgressSpinner style="width: 20px; height: 20px" strokeWidth="4" />
      <span>Searching...</span>
    </div>

    <div v-else-if="store.isSearching" class="search-status">
      <i class="pi pi-check-circle" style="color: var(--primary-color)"></i>
      <span>{{ store.searchResults.length }} results found</span>
    </div>
  </div>
</template>

<style scoped>
.search-bar-wrapper {
  position: relative;
  width: 100%;
}

.search-input {
  padding-right: 2.5rem !important;
}

.clear-icon {
  cursor: pointer;
  color: var(--text-color-secondary);
  transition: color 0.2s;
}

.clear-icon:hover {
  color: var(--text-color);
}

.search-status {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 0;
  right: 0;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
