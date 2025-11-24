// src/stores/explorer.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api.service'
import type { Item, ItemTreeNode, CreateItemDto, UpdateItemDto } from '@/types/item.types'

export const useExplorerStore = defineStore('explorer', () => {
  // State
  const folderTree = ref<ItemTreeNode[]>([])
  const selectedFolder = ref<Item | null>(null)
  const rightPanelItems = ref<Item[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const searchResults = ref<Item[]>([])

  // Computed
  const isSearching = computed(() => searchQuery.value.length > 0)

  // Actions
  async function loadFolderTree() {
    loading.value = true
    error.value = null
    try {
      const tree = await apiService.getFolderTree()
      folderTree.value = tree
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load folder tree'
      console.error('Error loading folder tree:', err)
    } finally {
      loading.value = false
    }
  }

  async function loadSubfolders(folderId: string | null) {
    loading.value = true
    error.value = null
    try {
      const items = await apiService.getSubfolders(folderId)
      rightPanelItems.value = items
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load subfolders'
      console.error('Error loading subfolders:', err)
    } finally {
      loading.value = false
    }
  }

  async function loadChildren(folderId: string | null, includeFiles = true) {
    loading.value = true
    error.value = null
    try {
      const items = await apiService.getChildren(folderId, includeFiles)
      rightPanelItems.value = items
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load children'
      console.error('Error loading children:', err)
    } finally {
      loading.value = false
    }
  }

  async function selectFolder(folder: Item | null) {
    selectedFolder.value = folder
    await loadSubfolders(folder?.id || null)
  }

  async function createItem(data: CreateItemDto) {
    loading.value = true
    error.value = null
    try {
      const newItem = await apiService.createItem(data)

      // Reload tree and right panel
      await loadFolderTree()
      if (selectedFolder.value) {
        await loadSubfolders(selectedFolder.value.id)
      }

      return newItem
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create item'
      console.error('Error creating item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateItem(id: string, data: UpdateItemDto) {
    loading.value = true
    error.value = null
    try {
      const updatedItem = await apiService.updateItem(id, data)

      // Reload tree and right panel
      await loadFolderTree()
      if (selectedFolder.value) {
        await loadSubfolders(selectedFolder.value.id)
      }

      return updatedItem
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update item'
      console.error('Error updating item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteItem(id: string) {
    loading.value = true
    error.value = null
    try {
      await apiService.deleteItem(id)

      // Reload tree and right panel
      await loadFolderTree()
      if (selectedFolder.value) {
        await loadSubfolders(selectedFolder.value.id)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete item'
      console.error('Error deleting item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function search(query: string) {
    searchQuery.value = query
    if (!query.trim()) {
      searchResults.value = []
      return
    }

    loading.value = true
    error.value = null
    try {
      const results = await apiService.searchItems(query)
      searchResults.value = results
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Search failed'
      console.error('Error searching:', err)
    } finally {
      loading.value = false
    }
  }

  function clearSearch() {
    searchQuery.value = ''
    searchResults.value = []
  }

  function toggleNodeExpansion(node: ItemTreeNode) {
    const toggleInTree = (nodes: ItemTreeNode[]): ItemTreeNode[] => {
      return nodes.map((n) => {
        if (n.id === node.id) {
          return { ...n, expanded: !n.expanded }
        }
        if (n.children) {
          return { ...n, children: toggleInTree(n.children) }
        }
        return n
      })
    }
    folderTree.value = toggleInTree(folderTree.value)
  }

  // Helper function to mark all nodes as expanded
  function markAllExpanded(nodes: ItemTreeNode[]): ItemTreeNode[] {
    return nodes.map((node) => ({
      ...node,
      expanded: true,
      children: node.children ? markAllExpanded(node.children) : undefined,
    }))
  }

  return {
    // State
    folderTree,
    selectedFolder,
    rightPanelItems,
    loading,
    error,
    searchQuery,
    searchResults,

    // Computed
    isSearching,

    // Actions
    loadFolderTree,
    loadSubfolders,
    loadChildren,
    selectFolder,
    createItem,
    updateItem,
    deleteItem,
    search,
    clearSearch,
    toggleNodeExpansion,
  }
})
