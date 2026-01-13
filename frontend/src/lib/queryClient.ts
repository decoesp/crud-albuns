import { QueryClient } from '@tanstack/react-query'

export const CACHE_TIMES = {
  ALBUMS_LIST: 1000 * 60 * 2,
  ALBUM_DETAIL: 1000 * 60 * 5,
  PHOTOS_LIST: 1000 * 60 * 2,
  PHOTO_DETAIL: 1000 * 60 * 10,
  PUBLIC_ALBUM: 1000 * 60 * 15,
  USER_PROFILE: 1000 * 60 * 30
} as const

export const STALE_TIMES = {
  ALBUMS_LIST: 1000 * 30,
  ALBUM_DETAIL: 1000 * 60,
  PHOTOS_LIST: 1000 * 30,
  PHOTO_DETAIL: 1000 * 60 * 2,
  PUBLIC_ALBUM: 1000 * 60 * 5,
  USER_PROFILE: 1000 * 60 * 5
} as const

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 10,
        retry: (failureCount, error) => {
          if ((error as { status?: number })?.status === 401) return false
          if ((error as { status?: number })?.status === 403) return false
          if ((error as { status?: number })?.status === 404) return false
          return failureCount < 2
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: true
      },
      mutations: {
        retry: false
      }
    }
  })
}

export const queryClient = createQueryClient()
