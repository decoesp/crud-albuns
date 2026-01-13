import { useState, useMemo, useCallback } from 'react'
import toast from 'react-hot-toast'
import { usePhotos } from './usePhotoQueries'
import { useDeletePhoto } from './usePhotoMutations'

interface UsePhotosPaginationParams {
  albumId: string
  limit?: number
}

export function usePhotosPagination({ albumId, limit = 20 }: UsePhotosPaginationParams) {
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const { data: photosData, isLoading } = usePhotos(albumId, { page, limit, sortBy, sortOrder })
  const deletePhotoMutation = useDeletePhoto()

  const photos = useMemo(() => photosData?.data ?? [], [photosData])
  const meta = photosData?.meta

  const handleSortChange = useCallback((value: string) => {
    const [newSortBy, newSortOrder] = value.split('-')
    setSortBy(newSortBy)
    setSortOrder(newSortOrder as 'asc' | 'desc')
    setPage(1)
  }, [])

  const sortValue = `${sortBy}-${sortOrder}`

  const goToNextPage = useCallback(() => setPage(p => p + 1), [])
  const goToPrevPage = useCallback(() => setPage(p => p - 1), [])

  const deletePhoto = useCallback(async (photoId: string) => {
    try {
      await deletePhotoMutation.mutateAsync({ albumId, photoId })
      toast.success('Foto excluída com sucesso!')
    } catch {
      toast.error('Erro ao excluir foto')
    }
  }, [albumId, deletePhotoMutation])

  return {
    photos,
    meta,
    isLoading,
    page,
    sortValue,
    handleSortChange,
    goToNextPage,
    goToPrevPage,
    deletePhoto,
    isDeleting: deletePhotoMutation.isPending
  }
}
