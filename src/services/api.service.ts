// src/services/api.service.ts
import axios, { type AxiosInstance } from 'axios'
import type {
  Item,
  ItemTreeNode,
  CreateItemDto,
  UpdateItemDto,
  ApiResponse,
} from '@/types/item.types'

class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message)
        return Promise.reject(error)
      },
    )
  }

  // Get all items
  async getAllItems(): Promise<Item[]> {
    const response = await this.client.get<ApiResponse<Item[]>>('/items')
    return response.data.data
  }

  // Get item by ID
  async getItemById(id: string): Promise<Item> {
    const response = await this.client.get<ApiResponse<Item>>(`/items/${id}`)
    return response.data.data
  }

  // Get folder tree structure
  async getFolderTree(): Promise<ItemTreeNode[]> {
    const response = await this.client.get<ApiResponse<ItemTreeNode[]>>('/folders/tree')
    return response.data.data
  }

  // Get direct subfolders
  async getSubfolders(folderId: string | null): Promise<Item[]> {
    const id = folderId || 'root'
    const response = await this.client.get<ApiResponse<Item[]>>(`/folders/${id}/subfolders`)
    return response.data.data
  }

  // Get children (folders and files)
  async getChildren(folderId: string | null, includeFiles = true): Promise<Item[]> {
    const id = folderId || 'root'
    const response = await this.client.get<ApiResponse<Item[]>>(`/folders/${id}/children`, {
      params: { includeFiles: includeFiles.toString() },
    })
    return response.data.data
  }

  // Search items
  async searchItems(query: string): Promise<Item[]> {
    if (!query.trim()) return []
    const response = await this.client.get<ApiResponse<Item[]>>('/items/search', {
      params: { q: query },
    })
    return response.data.data
  }

  // Create item
  async createItem(data: CreateItemDto): Promise<Item> {
    const response = await this.client.post<ApiResponse<Item>>('/items', data)
    return response.data.data
  }

  // Update item
  async updateItem(id: string, data: UpdateItemDto): Promise<Item> {
    const response = await this.client.patch<ApiResponse<Item>>(`/items/${id}`, data)
    return response.data.data
  }

  // Delete item
  async deleteItem(id: string): Promise<void> {
    await this.client.delete(`/items/${id}`)
  }
}

export const apiService = new ApiService()
