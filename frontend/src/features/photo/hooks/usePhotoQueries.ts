import { useQuery } from '@tanstack/react-query'
import { photoApi, ListPhotosParams } from '../api/photoApi'
import { albumKeys } from '../../album'

export const photoKeys = {
  all: ['photos'] as const,
  lists: () => [...photoKeys.all, 'list'] as const,
  list: (albumId: string, params: ListPhotosParams) => [...photoKeys.lists(), albumId, params] as const,
  details: () => [...photoKeys.all, 'detail'] as const,
  detail: (albumId: string, photoId: string) => [...photoKeys.details(), albumId, photoId] as const
}

export function usePhotos(albumId: string, params: ListPhotosParams = {}) {
  return useQuery({
    queryKey: photoKeys.list(albumId, params),
    queryFn: () => photoApi.list(albumId, params),
    enabled: !!albumId
  })
}

export function usePhoto(albumId: string, photoId: string) {
  return useQuery({
    queryKey: photoKeys.detail(albumId, photoId),
    queryFn: () => photoApi.getById(albumId, photoId),
    enabled: !!albumId && !!photoId
  })
}

export { albumKeys }
