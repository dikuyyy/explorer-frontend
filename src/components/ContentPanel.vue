<script setup lang="ts">
import { ref, computed } from 'vue'
import { useExplorerStore } from '@/stores/explorer.store'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import type { Item } from '@/types/item.types'

const store = useExplorerStore()
const confirm = useConfirm()
const toast = useToast()

const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const newItemName = ref('')
const newItemType = ref<'folder' | 'file'>('folder')
const editingItem = ref<Item | null>(null)

const viewMode = ref<'grid' | 'list'>('grid')
const showFiles = ref(true)

const displayItems = computed(() => {
  if (store.isSearching) {
    return store.searchResults
  }
  if (!showFiles.value) {
    return store.rightPanelItems.filter((item) => item.type === 'folder')
  }
  return store.rightPanelItems
})

const selectedFolderName = computed(() => {
  return store.selectedFolder?.name || 'Root'
})

const handleItemClick = (item: Item) => {
  if (item.type === 'folder') {
    store.selectFolder(item)
  }
}

const handleItemDoubleClick = (item: Item): void => {
  if (item.type === 'folder') {
    store.selectFolder(item)
  }
}

const openCreateDialog = () => {
  newItemName.value = ''
  newItemType.value = 'folder'
  showCreateDialog.value = true
}

const openEditDialog = (item: Item) => {
  editingItem.value = item
  newItemName.value = item.name
  showEditDialog.value = true
}

const createItem = async () => {
  if (!newItemName.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Please enter a name',
      life: 3000,
    })
    return
  }

  try {
    await store.createItem({
      name: newItemName.value.trim(),
      type: newItemType.value,
      parentId: store.selectedFolder?.id || null,
    })

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `${newItemType.value === 'folder' ? 'Folder' : 'File'} created successfully`,
      life: 3000,
    })

    showCreateDialog.value = false
  } catch (error) {
    console.error('Create item error:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create item',
      life: 3000,
    })
  }
}

const updateItem = async () => {
  if (!editingItem.value || !newItemName.value.trim()) return

  try {
    await store.updateItem(editingItem.value.id, {
      name: newItemName.value.trim(),
    })

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Item renamed successfully',
      life: 3000,
    })

    showEditDialog.value = false
    editingItem.value = null
  } catch (error) {
    console.error('Update item error:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to rename item',
      life: 3000,
    })
  }
}

const confirmDelete = (item: Item) => {
  confirm.require({
    message: `Are you sure you want to delete "${item.name}"?`,
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteItem(item),
  })
}

const deleteItem = async (item: Item) => {
  try {
    await store.deleteItem(item.id)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Item deleted successfully',
      life: 3000,
    })
  } catch (error) {
    console.error('Delete item error:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete item',
      life: 3000,
    })
  }
}

const getItemIcon = (item: Item) => {
  if (item.type === 'folder') {
    return 'pi pi-folder'
  }

  const ext = item.name.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf':
      return 'pi pi-file-pdf'
    case 'doc':
    case 'docx':
      return 'pi pi-file-word'
    case 'xls':
    case 'xlsx':
      return 'pi pi-file-excel'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'pi pi-image'
    case 'mp4':
    case 'avi':
    case 'mov':
      return 'pi pi-video'
    default:
      return 'pi pi-file'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}
</script>

<template>
  <div class="content-panel">
    <div class="content-panel-header">
      <div class="header-left">
        <h3>
          <i class="pi pi-folder-open"></i>
          {{ selectedFolderName }}
        </h3>
        <span class="item-count">{{ displayItems.length }} items</span>
      </div>

      <div class="header-actions">
        <Button
          icon="pi pi-plus"
          label="New"
          @click="openCreateDialog"
          severity="success"
          size="small"
        />

        <SelectButton
          v-model="viewMode"
          :options="[
            { label: 'Grid', value: 'grid', icon: 'pi pi-th-large' },
            { label: 'List', value: 'list', icon: 'pi pi-list' },
          ]"
          optionLabel="label"
          optionValue="value"
          class="view-mode-toggle"
        >
          <template #option="{ option }">
            <i :class="option.icon"></i>
          </template>
        </SelectButton>

        <div class="flex gap-4" style="width: auto">
          <span class="p-inputgroup-addon">
            <i class="pi pi-filter"></i>
          </span>
          <InputSwitch v-model="showFiles" />
          <span class="p-inputgroup-addon">Show Files</span>
        </div>
      </div>
    </div>

    <div class="content-panel-body">
      <div v-if="store.loading" class="loading-container">
        <ProgressSpinner style="width: 50px; height: 50px" />
      </div>

      <div v-else-if="displayItems.length === 0" class="empty-container">
        <i class="pi pi-inbox empty-icon"></i>
        <p>{{ store.isSearching ? 'No results found' : 'This folder is empty' }}</p>
      </div>

      <div v-else-if="viewMode === 'grid'" class="items-grid">
        <div
          v-for="item in displayItems"
          :key="item.id"
          class="item-card"
          @click="handleItemClick(item)"
          @dblclick="handleItemDoubleClick(item)"
        >
          <ContextMenu
            :model="[
              {
                label: 'Open',
                icon: 'pi pi-folder-open',
                command: () => handleItemClick(item),
                visible: item.type === 'folder',
              },
              { label: 'Rename', icon: 'pi pi-pencil', command: () => openEditDialog(item) },
              { separator: true },
              {
                label: 'Delete',
                icon: 'pi pi-trash',
                command: () => confirmDelete(item),
                class: 'text-red-500',
              },
            ]"
            ref="menu"
          />

          <i :class="getItemIcon(item)" class="item-icon"></i>
          <span class="item-name">{{ item.name }}</span>
          <span class="item-type">{{ item.type }}</span>

          <div class="item-actions">
            <Button
              icon="pi pi-pencil"
              @click.stop="openEditDialog(item)"
              text
              rounded
              size="small"
            />
            <Button
              icon="pi pi-trash"
              @click.stop="confirmDelete(item)"
              text
              rounded
              severity="danger"
              size="small"
            />
          </div>
        </div>
      </div>

      <DataTable
        v-else
        :value="displayItems"
        class="items-table"
        stripedRows
        @row-click="(event) => handleItemClick(event.data)"
        @row-dblclick="(event) => handleItemDoubleClick(event.data)"
      >
        <Column field="name" header="Name" sortable>
          <template #body="{ data }">
            <i :class="getItemIcon(data)" style="margin-right: 0.5rem"></i>
            {{ data.name }}
          </template>
        </Column>
        <Column field="type" header="Type" sortable></Column>
        <Column field="createdAt" header="Created" sortable>
          <template #body="{ data }">
            {{ formatDate(data.createdAt) }}
          </template>
        </Column>
        <Column header="Actions" style="width: 150px">
          <template #body="{ data }">
            <Button
              icon="pi pi-pencil"
              @click.stop="openEditDialog(data)"
              text
              rounded
              size="small"
            />
            <Button
              icon="pi pi-trash"
              @click.stop="confirmDelete(data)"
              text
              rounded
              severity="danger"
              size="small"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Create Dialog -->
    <Dialog
      v-model:visible="showCreateDialog"
      header="Create New Item"
      :modal="true"
      :style="{ width: '400px' }"
    >
      <div class="dialog-content">
        <div class="p-field">
          <label for="itemType">Type</label>
          <SelectButton
            v-model="newItemType"
            :options="[
              { label: 'Folder', value: 'folder' },
              { label: 'File', value: 'file' },
            ]"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>

        <div class="p-field">
          <label for="itemName">Name</label>
          <InputText
            id="itemName"
            v-model="newItemName"
            class="w-full"
            placeholder="Enter name"
            @keyup.enter="createItem"
            autofocus
          />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" @click="showCreateDialog = false" text />
        <Button label="Create" @click="createItem" />
      </template>
    </Dialog>

    <!-- Edit Dialog -->
    <Dialog
      v-model:visible="showEditDialog"
      header="Rename Item"
      :modal="true"
      :style="{ width: '400px' }"
    >
      <div class="dialog-content">
        <div class="p-field">
          <label for="editItemName">Name</label>
          <InputText
            id="editItemName"
            v-model="newItemName"
            class="w-full"
            placeholder="Enter new name"
            @keyup.enter="updateItem"
            autofocus
          />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" @click="showEditDialog = false" text />
        <Button label="Save" @click="updateItem" />
      </template>
    </Dialog>

    <ConfirmDialog />
  </div>
</template>

<style scoped>
.content-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--surface-ground);
}

.content-panel-header {
  padding: 1rem;
  border-bottom: 1px solid var(--surface-border);
  background: var(--surface-section);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-left h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color);
}

.item-count {
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-mode-toggle {
  width: auto;
}

.content-panel-body {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 1rem;
  color: var(--text-color-secondary);
}

.empty-icon {
  font-size: 4rem;
  color: var(--text-color-secondary);
  opacity: 0.5;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.item-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  background: var(--surface-card);
}

.item-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.item-card:hover .item-actions {
  opacity: 1;
}

.item-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.item-card .pi-folder {
  color: #ffd700;
}

.item-name {
  text-align: center;
  font-size: 0.9rem;
  word-break: break-word;
  margin-bottom: 0.25rem;
}

.item-type {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  text-transform: capitalize;
}

.item-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.items-table {
  cursor: pointer;
}

:deep(.items-table .p-datatable-tbody > tr:hover) {
  background: var(--surface-hover) !important;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.p-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.p-field label {
  font-weight: 600;
}

.w-full {
  width: 100%;
}
</style>
