import api from '../../../lib/api'
import { Album, PaginatedResponse } from '../../../types'

export interface ListAlbumsParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

export interface ShareResult {
  isPublic: boolean
  shareToken: string | null
}

export const albumApi = {
  list: async (params: ListAlbumsParams) => {
    const response = await api.get<PaginatedResponse<Album>>('/albums', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get<Album>(`/albums/${id}`)
    return response.data
  },

  create: async (data: { title: string; description?: string }) => {
    const response = await api.post<Album>('/albums', data)
    return response.data
  },

  update: async (id: string, data: { title?: string; description?: string }) => {
    const response = await api.patch<Album>(`/albums/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    await api.delete(`/albums/${id}`)
  },

  toggleShare: async (id: string, isPublic: boolean) => {
    const response = await api.post<ShareResult>(`/albums/${id}/share`, { isPublic })
    return response.data
  },

  getByShareToken: async (shareToken: string) => {
    const response = await api.get(`/public/albums/${shareToken}`)
    return response.data
  }
}
