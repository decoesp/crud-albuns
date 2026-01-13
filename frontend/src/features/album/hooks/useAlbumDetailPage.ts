import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAlbum } from './useAlbumQueries'
import { useUpdateAlbum, useDeleteAlbum, useToggleShareAlbum } from './useAlbumMutations'
import { Photo } from '../../../types'

interface UseAlbumDetailPageParams {
  albumId: string
}

export function useAlbumDetailPage({ albumId }: UseAlbumDetailPageParams) {
  const navigate = useNavigate()

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [deleteAlbumConfirm, setDeleteAlbumConfirm] = useState(false)
  const [deletePhotoConfirm, setDeletePhotoConfirm] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ title: '', description: '' })

  const { data: album, isLoading: albumLoading } = useAlbum(albumId)
  const updateAlbum = useUpdateAlbum()
  const deleteAlbum = useDeleteAlbum()
  const toggleShare = useToggleShareAlbum()

  const openUploadModal = useCallback(() => setIsUploadModalOpen(true), [])
  const closeUploadModal = useCallback(() => setIsUploadModalOpen(false), [])

  const openEditModal = useCallback(() => {
    if (album) {
      setEditForm({ title: album.title, description: album.description || '' })
      setIsEditModalOpen(true)
    }
  }, [album])

  const closeEditModal = useCallback(() => setIsEditModalOpen(false), [])

  const handleEditAlbum = useCallback(async () => {
    try {
      await updateAlbum.mutateAsync({ id: albumId, data: editForm })
      toast.success('Álbum atualizado com sucesso!')
      setIsEditModalOpen(false)
    } catch {
      toast.error('Erro ao atualizar álbum')
    }
  }, [albumId, editForm, updateAlbum])

  const handleDeleteAlbum = useCallback(async () => {
    try {
      await deleteAlbum.mutateAsync(albumId)
      toast.success('Álbum excluído com sucesso!')
      navigate('/albums')
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message || 'Erro ao excluir álbum'
      toast.error(message)
    }
    setDeleteAlbumConfirm(false)
  }, [albumId, deleteAlbum, navigate])

  const handleShare = useCallback(async () => {
    if (!album) return
    try {
      const result = await toggleShare.mutateAsync({ id: albumId, isPublic: !album.isPublic })
      if (result.shareToken) {
        const shareUrl = `${window.location.origin}/public/albums/${result.shareToken}`
        navigator.clipboard.writeText(shareUrl)
        toast.success('Link copiado!')
      } else {
        toast.success('Compartilhamento desativado')
      }
    } catch {
      toast.error('Erro ao alterar compartilhamento')
    }
  }, [album, albumId, toggleShare])

  const openDeleteAlbumConfirm = useCallback(() => setDeleteAlbumConfirm(true), [])
  const closeDeleteAlbumConfirm = useCallback(() => setDeleteAlbumConfirm(false), [])

  const openDeletePhotoConfirm = useCallback((photoId: string) => setDeletePhotoConfirm(photoId), [])
  const closeDeletePhotoConfirm = useCallback(() => setDeletePhotoConfirm(null), [])

  const selectPhoto = useCallback((photo: Photo | null) => setSelectedPhoto(photo), [])

  const updateEditForm = useMemo(() => ({
    setTitle: (value: string) => setEditForm(f => ({ ...f, title: value })),
    setDescription: (value: string) => setEditForm(f => ({ ...f, description: value }))
  }), [])

  return {
    album,
    albumLoading,
    viewMode,
    setViewMode,
    isUploadModalOpen,
    openUploadModal,
    closeUploadModal,
    isEditModalOpen,
    openEditModal,
    closeEditModal,
    selectedPhoto,
    selectPhoto,
    deleteAlbumConfirm,
    openDeleteAlbumConfirm,
    closeDeleteAlbumConfirm,
    deletePhotoConfirm,
    openDeletePhotoConfirm,
    closeDeletePhotoConfirm,
    editForm,
    updateEditForm,
    handleEditAlbum,
    handleDeleteAlbum,
    handleShare,
    isUpdating: updateAlbum.isPending,
    isDeleting: deleteAlbum.isPending
  }
}
