import api from '../../../lib/api'
import { Photo, PaginatedResponse, UploadUrlResponse } from '../../../types'

export interface ListPhotosParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const photoApi = {
  list: async (albumId: string, params: ListPhotosParams) => {
    const response = await api.get<PaginatedResponse<Photo>>(`/albums/${albumId}/photos`, { params })
    return response.data
  },

  getById: async (albumId: string, photoId: string) => {
    const response = await api.get<Photo>(`/albums/${albumId}/photos/${photoId}`)
    return response.data
  },

  create: async (albumId: string, data: Partial<Photo> & { s3Key: string }) => {
    const response = await api.post<Photo>(`/albums/${albumId}/photos`, data)
    return response.data
  },

  update: async (albumId: string, photoId: string, data: Partial<Photo>) => {
    const response = await api.patch<Photo>(`/albums/${albumId}/photos/${photoId}`, data)
    return response.data
  },

  delete: async (albumId: string, photoId: string) => {
    await api.delete(`/albums/${albumId}/photos/${photoId}`)
  },

  generateUploadUrl: async (albumId: string, filename: string, contentType: string) => {
    const response = await api.post<UploadUrlResponse>(`/albums/${albumId}/photos/upload-url`, {
      filename,
      contentType
    })
    return response.data
  },

  generateBatchUploadUrls: async (
    albumId: string,
    files: Array<{ filename: string; contentType: string }>
  ) => {
    const response = await api.post<UploadUrlResponse[]>(
      `/albums/${albumId}/photos/batch-upload-url`,
      { files }
    )
    return response.data
  },

  processMetadata: async (albumId: string, photoId: string) => {
    const response = await api.post<Photo>(`/albums/${albumId}/photos/${photoId}/process-metadata`)
    return response.data
  }
}
