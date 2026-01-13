import { useState } from 'react'
import { Plus, Grid, List, Image as ImageIcon } from 'lucide-react'
import { useAlbums } from '../features/album/hooks/useAlbumQueries'
import { useCreateAlbum, useDeleteAlbum, useToggleShareAlbum } from '../features/album/hooks/useAlbumMutations'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import AlbumCard from '../components/album/AlbumCard'
import AlbumListItem from '../components/album/AlbumListItem'
import CreateAlbumModal from '../components/album/CreateAlbumModal'
import { cn } from '../lib/utils'
import { Album } from '../types'
import toast from 'react-hot-toast'

export default function AlbumsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useAlbums({ page, limit: 12 })
  const createAlbum = useCreateAlbum()
  const deleteAlbum = useDeleteAlbum()
  const toggleShare = useToggleShareAlbum()

  const onCreateSubmit = async (data: { title: string; description?: string }) => {
    await createAlbum.mutateAsync(data)
    setIsCreateModalOpen(false)
  }

  const handleDeleteClick = (album: Album) => {
    setDeleteConfirm({ id: album.id, title: album.title })
  }

  const handleDeleteConfirm = async () => {
    if (deleteConfirm) {
      await deleteAlbum.mutateAsync(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  const handleShare = async (album: Album) => {
    const result = await toggleShare.mutateAsync({ id: album.id, isPublic: !album.isPublic })
    if (result.shareToken) {
      const shareUrl = `${window.location.origin}/public/albums/${result.shareToken}`
      navigator.clipboard.writeText(shareUrl)
      toast.success('Link copiado para a área de transferência!')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Meus Álbuns</h1>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('p-2 rounded', viewMode === 'grid' ? 'bg-white shadow' : '')}
              aria-label="Visualização em grade"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('p-2 rounded', viewMode === 'list' ? 'bg-white shadow' : '')}
              aria-label="Visualização em lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="flex-1 sm:flex-none" size="sm">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Criar novo álbum</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      {data?.data.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Nenhum álbum ainda</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">Crie seu primeiro álbum para começar a organizar suas fotos.</p>
          <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Criar álbum
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {data?.data.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              onShare={handleShare}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Álbum</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Fotos</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Criado em</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((album) => (
                <AlbumListItem
                  key={album.id}
                  album={album}
                  onShare={handleShare}
                  onDelete={handleDeleteClick}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-2 mt-6 sm:mt-8">
          <Button variant="secondary" size="sm" disabled={!data.meta.hasPrev} onClick={() => setPage((p) => p - 1)} className="w-full sm:w-auto">
            Anterior
          </Button>
          <span className="px-4 py-2 text-xs sm:text-sm text-gray-600">
            Página {data.meta.page} de {data.meta.totalPages}
          </span>
          <Button variant="secondary" size="sm" disabled={!data.meta.hasNext} onClick={() => setPage((p) => p + 1)} className="w-full sm:w-auto">
            Próxima
          </Button>
        </div>
      )}

      <CreateAlbumModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={onCreateSubmit}
        isLoading={createAlbum.isPending}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Excluir álbum"
        message={`Tem certeza que deseja excluir o álbum "${deleteConfirm?.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteAlbum.isPending}
      />
    </div>
  )
}
