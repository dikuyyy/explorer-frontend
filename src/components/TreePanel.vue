<script setup lang="ts">
import { useExplorerStore } from '@/stores/explorer.store'
import type { ItemTreeNode } from '@/types/item.types'
import TreeNode from './TreeNode.vue'

const store = useExplorerStore()

const handleNodeClick = (node: ItemTreeNode) => {
  store.selectFolder(node)
}

const toggleNode = (node: ItemTreeNode) => {
  store.toggleNodeExpansion(node)
}
</script>

<template>
  <div class="tree-panel">
    <div class="tree-panel-header">
      <h3>
        <i class="pi pi-folder"></i>
        Folders
      </h3>
    </div>

    <div class="tree-panel-content">
      <div v-if="store.loading && store.folderTree.length === 0" class="loading-container">
        <div class="spinner"></div>
        <p>Loading folders...</p>
      </div>

      <div v-else-if="store.error" class="error-container">
        <div class="error-message">
          <i class="pi pi-exclamation-circle"></i>
          <span>{{ store.error }}</span>
        </div>
      </div>

      <div v-else class="folder-tree">
        <TreeNode
          v-for="node in store.folderTree"
          :key="node.id"
          :node="node"
          :selected-id="store.selectedFolder?.id"
          @select="handleNodeClick"
          @toggle="toggleNode"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.tree-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--surface-ground);
  border-right: 1px solid var(--surface-border);
}

.tree-panel-header {
  padding: 1rem;
  border-bottom: 1px solid var(--surface-border);
  background: var(--surface-section);
}

.tree-panel-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color);
}

.tree-panel-content {
  flex: 1;
  overflow: auto;
  padding: 0.5rem;
}

.folder-tree {
  width: 100%;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3rem 2rem;
  gap: 1rem;
  color: var(--text-color-secondary, #6b7280);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--surface-border, #e5e7eb);
  border-top-color: var(--primary-color, #3b82f6);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--red-50, #fef2f2);
  color: var(--red-600, #dc2626);
  border-radius: 6px;
  border: 1px solid var(--red-200, #fecaca);
}

.error-message i {
  font-size: 1.25rem;
}
</style>
