import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { Photo, PaginatedResponse, UploadUrlResponse } from '../types'
import toast from 'react-hot-toast'

interface ListPhotosParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function usePhotos(albumId: string, params: ListPhotosParams = {}) {
  return useQuery({
    queryKey: ['photos', albumId, params],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Photo>>(`/albums/${albumId}/photos`, { params })
      return response.data
    },
    enabled: !!albumId
  })
}

export function usePhoto(albumId: string, photoId: string) {
  return useQuery({
    queryKey: ['photo', albumId, photoId],
    queryFn: async () => {
      const response = await api.get<Photo>(`/albums/${albumId}/photos/${photoId}`)
      return response.data
    },
    enabled: !!albumId && !!photoId
  })
}

export function useGenerateUploadUrl() {
  return useMutation({
    mutationFn: async ({ albumId, filename, contentType }: { albumId: string; filename: string; contentType: string }) => {
      const response = await api.post<UploadUrlResponse>(`/albums/${albumId}/photos/upload-url`, {
        filename,
        contentType
      })
      return response.data
    }
  })
}

export function useGenerateBatchUploadUrls() {
  return useMutation({
    mutationFn: async ({ albumId, files }: { albumId: string; files: Array<{ filename: string; contentType: string }> }) => {
      const response = await api.post<UploadUrlResponse[]>(`/albums/${albumId}/photos/batch-upload-url`, { files })
      return response.data
    }
  })
}

export function useCreatePhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ albumId, data }: { albumId: string; data: Partial<Photo> & { s3Key: string } }) => {
      const response = await api.post<Photo>(`/albums/${albumId}/photos`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['photos', variables.albumId] })
      queryClient.invalidateQueries({ queryKey: ['albums'] })
    }
  })
}

export function useUpdatePhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ albumId, photoId, data }: { albumId: string; photoId: string; data: Partial<Photo> }) => {
      const response = await api.patch<Photo>(`/albums/${albumId}/photos/${photoId}`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['photos', variables.albumId] })
      queryClient.invalidateQueries({ queryKey: ['photo', variables.albumId, variables.photoId] })
      toast.success('Foto atualizada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar foto')
    }
  })
}

export function useProcessPhotoMetadata() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ albumId, photoId }: { albumId: string; photoId: string }) => {
      const response = await api.post<Photo>(`/albums/${albumId}/photos/${photoId}/process-metadata`)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['photos', variables.albumId] })
      queryClient.invalidateQueries({ queryKey: ['photo', variables.albumId, variables.photoId] })
    },
    onError: () => {
      console.warn('Falha ao processar metadados automaticamente')
    }
  })
}

export function useDeletePhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ albumId, photoId }: { albumId: string; photoId: string }) => {
      await api.delete(`/albums/${albumId}/photos/${photoId}`)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['photos', variables.albumId] })
      queryClient.invalidateQueries({ queryKey: ['albums'] })
      toast.success('Foto excluída com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao excluir foto')
    }
  })
}
