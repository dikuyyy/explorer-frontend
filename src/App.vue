<script setup lang="ts">
import TreePanel from './components/TreePanel.vue'
import SearchBar from './components/SearchBar.vue'
import ContentPanel from './components/ContentPanel.vue'

import { useExplorerStore } from './stores/explorer.store'
import { onMounted } from 'vue'

const store = useExplorerStore()

onMounted(() => {
  store.loadFolderTree()
  store.loadSubfolders(null)
})
</script>

<template>
  <div class="windows-explorer h-screen">
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <i class="pi pi-folder-open header-icon"></i>
          <h1>Windows Explorer</h1>
        </div>
        <div class="header-center">
          <SearchBar />
        </div>
      </div>
    </header>
    <main class="app-main">
      <Splitter class="explorer-splitter">
        <SplitterPanel :size="25" class="left-panel">
          <TreePanel />
        </SplitterPanel>
        <SplitterPanel :size="75" class="right-panel">
          <ContentPanel />
        </SplitterPanel>
      </Splitter>
    </main>
  </div>
</template>

<style scoped>
.windows-explorer {
  display: flex;
  flex-direction: column;
  background: var(--surface-ground);
}

.app-header {
  background: var(--surface-section);
  border-bottom: 2px solid var(--surface-border);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1rem 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 200px;
}

.header-icon {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.header-left h1 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.header-center {
  flex: 1;
  max-width: 600px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.app-main {
  flex: 1;
  overflow: hidden;
}

.explorer-splitter {
  height: 100%;
  border: none;
}

.left-panel,
.right-panel {
  height: 100%;
  overflow: hidden;
}
</style>
