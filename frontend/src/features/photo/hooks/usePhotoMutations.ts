import { useMutation, useQueryClient } from '@tanstack/react-query'
import { photoApi } from '../api/photoApi'
import { photoKeys, albumKeys } from './usePhotoQueries'
import { Photo } from '../../../types'

export function useCreatePhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ albumId, data }: { albumId: string; data: Partial<Photo> & { s3Key: string } }) =>
      photoApi.create(albumId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: photoKeys.list(variables.albumId, {}) })
      queryClient.invalidateQueries({ queryKey: albumKeys.all })
    }
  })
}

export function useUpdatePhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ albumId, photoId, data }: { albumId: string; photoId: string; data: Partial<Photo> }) =>
      photoApi.update(albumId, photoId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: photoKeys.list(variables.albumId, {}) })
      queryClient.invalidateQueries({ queryKey: photoKeys.detail(variables.albumId, variables.photoId) })
    }
  })
}

export function useDeletePhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ albumId, photoId }: { albumId: string; photoId: string }) =>
      photoApi.delete(albumId, photoId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: photoKeys.list(variables.albumId, {}) })
      queryClient.invalidateQueries({ queryKey: albumKeys.all })
    }
  })
}

export function useGenerateUploadUrl() {
  return useMutation({
    mutationFn: ({ albumId, filename, contentType }: { albumId: string; filename: string; contentType: string }) =>
      photoApi.generateUploadUrl(albumId, filename, contentType)
  })
}

export function useGenerateBatchUploadUrls() {
  return useMutation({
    mutationFn: ({ albumId, files }: { albumId: string; files: Array<{ filename: string; contentType: string }> }) =>
      photoApi.generateBatchUploadUrls(albumId, files)
  })
}

export function useProcessPhotoMetadata() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ albumId, photoId }: { albumId: string; photoId: string }) =>
      photoApi.processMetadata(albumId, photoId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: photoKeys.list(variables.albumId, {}) })
      queryClient.invalidateQueries({ queryKey: photoKeys.detail(variables.albumId, variables.photoId) })
    }
  })
}
