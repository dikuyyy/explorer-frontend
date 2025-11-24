export type ItemType = 'folder' | 'file'

export interface Item {
  id: string
  name: string
  type: ItemType
  parentId: string | null
  path: string
  createdAt: string
  updatedAt: string
}

export interface ItemTreeNode extends Item {
  key: string
  label?: string
  data?: unknown
  icon?: string
  children?: ItemTreeNode[]
  style?: Record<string, unknown>
  styleClass?: string
  selectable?: boolean
  leaf?: boolean
  expanded?: boolean
  loading?: boolean
}

export interface CreateItemDto {
  name: string
  type: ItemType
  parentId?: string | null
}

export interface UpdateItemDto {
  name?: string
  parentId?: string | null
}

export interface ApiResponse<T> {
  data: T
  count?: number
}

export interface ErrorResponse {
  error: string
  message: string
  statusCode: number
}
