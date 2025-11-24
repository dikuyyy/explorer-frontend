<script setup lang="ts">
import type { ItemTreeNode } from '@/types/item.types'

interface Props {
  node: ItemTreeNode
  level?: number
  selectedId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
  selectedId: null,
})

const emit = defineEmits<{
  select: [node: ItemTreeNode]
  toggle: [node: ItemTreeNode]
}>()

const handleToggle = (e: Event) => {
  e.stopPropagation()
  emit('toggle', props.node)
}

const handleSelect = () => {
  emit('select', props.node)
}

const hasChildren = props.node.children && props.node.children.length > 0
const isSelected = props.selectedId === props.node.id
</script>

<template>
  <div class="tree-node-container">
    <div
      class="tree-node-content"
      :class="{ 'is-selected': isSelected }"
      :style="{ paddingLeft: `${level * 1.25}rem` }"
      @click="handleSelect"
    >
      <span
        class="toggle-icon"
        :class="{ 'has-children': hasChildren, 'is-leaf': !hasChildren }"
        @click="handleToggle"
      >
        <i
          v-if="hasChildren"
          :class="node.expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
        ></i>
        <i v-else class="pi pi-circle-fill" style="font-size: 0.4rem; opacity: 0.3"></i>
      </span>
      <i
        :class="node.expanded && hasChildren ? 'pi pi-folder-open' : 'pi pi-folder'"
        class="folder-icon"
      ></i>
      <span class="node-label">{{ node.name }}</span>
    </div>

    <div v-if="node.expanded && hasChildren" class="tree-node-children">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        :selected-id="selectedId"
        @select="(n) => emit('select', n)"
        @toggle="(n) => emit('toggle', n)"
      />
    </div>
  </div>
</template>

<style scoped>
.tree-node-container {
  width: 100%;
}

.tree-node-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
  user-select: none;
  border-radius: 4px;
}

.tree-node-content:hover {
  background: var(--surface-hover, rgba(0, 0, 0, 0.05));
}

.tree-node-content.is-selected {
  background: var(--primary-color, #3b82f6);
  color: var(--primary-color-text, white);
}

.tree-node-content.is-selected .folder-icon {
  color: currentColor;
}

.toggle-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.toggle-icon.has-children {
  cursor: pointer;
}

.toggle-icon.has-children:hover {
  opacity: 0.7;
}

.toggle-icon.is-leaf {
  pointer-events: none;
}

.folder-icon {
  color: #ffd700;
  font-size: 1rem;
  flex-shrink: 0;
}

.node-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-node-children {
  width: 100%;
}
</style>
