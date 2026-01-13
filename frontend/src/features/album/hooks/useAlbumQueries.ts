import { useQuery } from '@tanstack/react-query'
import { albumApi, ListAlbumsParams } from '../api/albumApi'

export const albumKeys = {
  all: ['albums'] as const,
  lists: () => [...albumKeys.all, 'list'] as const,
  list: (params: ListAlbumsParams) => [...albumKeys.lists(), params] as const,
  details: () => [...albumKeys.all, 'detail'] as const,
  detail: (id: string) => [...albumKeys.details(), id] as const,
  public: (shareToken: string) => ['public-album', shareToken] as const
}

export function useAlbums(params: ListAlbumsParams = {}) {
  return useQuery({
    queryKey: albumKeys.list(params),
    queryFn: () => albumApi.list(params)
  })
}

export function useAlbum(id: string) {
  return useQuery({
    queryKey: albumKeys.detail(id),
    queryFn: () => albumApi.getById(id),
    enabled: !!id
  })
}

export function usePublicAlbum(shareToken: string) {
  return useQuery({
    queryKey: albumKeys.public(shareToken),
    queryFn: () => albumApi.getByShareToken(shareToken),
    enabled: !!shareToken
  })
}
