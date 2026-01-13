import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Upload, Edit, Share2 } from 'lucide-react'
import { useAlbumDetailPage, usePhotosPagination } from '../features'
import { usePhotoUpload } from '../hooks/usePhotoUpload'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { PhotoGrid, PhotoTable, UploadModal, PhotoDetailModal, EditAlbumModal } from '../components/album'
import { cn } from '../lib/utils'

export default function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>()

  const albumDetail = useAlbumDetailPage({ albumId: id! })
  const photosPagination = usePhotosPagination({ albumId: id! })

  const upload = usePhotoUpload({
    albumId: id!,
    onSuccess: albumDetail.closeUploadModal
  })

  if (albumDetail.albumLoading || photosPagination.isLoading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-label="Carregando">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!albumDetail.album) {
    return <div className="text-center py-12">Álbum não encontrado</div>
  }

  const { album } = albumDetail

  return (
    <div>
      <header className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Link to="/albums" className="p-2 hover:bg-gray-100 rounded-lg self-start" aria-label="Voltar para álbuns">
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{album.title}</h1>
          <p className="text-sm sm:text-base text-gray-600 line-clamp-2">{album.description || 'Sem descrição'}</p>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
          <Button variant="ghost" size="sm" onClick={albumDetail.openEditModal} className="flex-1 sm:flex-none" aria-label="Editar álbum">
            <Edit className="w-4 h-4" aria-hidden="true" />
            <span className="sm:hidden ml-2">Editar</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={albumDetail.handleShare} className="flex-1 sm:flex-none" aria-label={album.isPublic ? 'Desativar compartilhamento' : 'Compartilhar álbum'}>
            <Share2 className={cn('w-4 h-4', album.isPublic ? 'text-green-600' : '')} aria-hidden="true" />
            <span className="sm:hidden ml-2">Compartilhar</span>
          </Button>
          <Button variant="danger" size="sm" onClick={albumDetail.openDeleteAlbumConfirm} className="flex-1 sm:flex-none" aria-label="Excluir álbum">
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span className="sm:hidden ml-2">Excluir</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-gray-600">Visualizar:</span>
            <div className="flex items-center bg-gray-100 rounded-lg p-1" role="tablist">
              <button
                onClick={() => albumDetail.setViewMode('table')}
                className={cn('px-3 py-1 rounded text-sm', albumDetail.viewMode === 'table' ? 'bg-white shadow' : '')}
                role="tab"
                aria-selected={albumDetail.viewMode === 'table'}
              >
                Tabela
              </button>
              <button
                onClick={() => albumDetail.setViewMode('grid')}
                className={cn('px-3 py-1 rounded text-sm', albumDetail.viewMode === 'grid' ? 'bg-white shadow' : '')}
                role="tab"
                aria-selected={albumDetail.viewMode === 'grid'}
              >
                Grade
              </button>
            </div>
          </div>
          <select
            value={photosPagination.sortValue}
            onChange={(e) => photosPagination.handleSortChange(e.target.value)}
            className="input w-full sm:w-auto text-sm"
            aria-label="Ordenar fotos"
          >
            <option value="createdAt-desc">Mais recentes</option>
            <option value="createdAt-asc">Mais antigas</option>
            <option value="acquisitionDate-desc">Data aquisição ↓</option>
            <option value="acquisitionDate-asc">Data aquisição ↑</option>
            <option value="size-desc">Maior tamanho</option>
            <option value="size-asc">Menor tamanho</option>
          </select>
        </div>
        <Button onClick={albumDetail.openUploadModal} size="sm" className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          Adicionar fotos
        </Button>
      </div>

      <main>
        {photosPagination.photos.length === 0 ? (
          <div className="text-center py-8 sm:py-12 card">
            <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" aria-hidden="true" />
            <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Nenhuma foto ainda</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">Adicione fotos a este álbum.</p>
            <Button onClick={albumDetail.openUploadModal} size="sm">
              <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
              Adicionar fotos
            </Button>
          </div>
        ) : albumDetail.viewMode === 'grid' ? (
          <PhotoGrid
            photos={photosPagination.photos}
            onPhotoClick={albumDetail.selectPhoto}
            onDeleteClick={albumDetail.openDeletePhotoConfirm}
          />
        ) : (
          <PhotoTable
            photos={photosPagination.photos}
            onPhotoClick={albumDetail.selectPhoto}
            onDeleteClick={albumDetail.openDeletePhotoConfirm}
          />
        )}
      </main>

      {photosPagination.meta && photosPagination.meta.totalPages > 1 && (
        <nav className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-6 sm:mt-8" aria-label="Paginação">
          <Button
            variant="secondary"
            size="sm"
            disabled={!photosPagination.meta.hasPrev}
            onClick={photosPagination.goToPrevPage}
            className="w-full sm:w-auto"
          >
            Anterior
          </Button>
          <span className="px-4 py-2 text-xs sm:text-sm text-gray-600">
            Página {photosPagination.meta.page} de {photosPagination.meta.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={!photosPagination.meta.hasNext}
            onClick={photosPagination.goToNextPage}
            className="w-full sm:w-auto"
          >
            Próxima
          </Button>
        </nav>
      )}

      <UploadModal
        isOpen={albumDetail.isUploadModalOpen}
        onClose={() => { albumDetail.closeUploadModal(); upload.reset() }}
        onDrop={upload.onDrop}
        onUpload={upload.handleUpload}
        onRemoveFile={upload.removeFile}
        onUpdateMetadata={upload.updateMetadata}
        compressedFiles={upload.compressedFiles}
        isCompressing={upload.isCompressing}
        compressionStats={upload.compressionStats}
        uploadProgress={upload.uploadProgress}
        photoMetadata={upload.photoMetadata}
        isUploading={upload.isUploading}
      />

      <EditAlbumModal
        isOpen={albumDetail.isEditModalOpen}
        onClose={albumDetail.closeEditModal}
        onSave={albumDetail.handleEditAlbum}
        isLoading={albumDetail.isUpdating}
        title={albumDetail.editForm.title}
        description={albumDetail.editForm.description}
        onTitleChange={albumDetail.updateEditForm.setTitle}
        onDescriptionChange={albumDetail.updateEditForm.setDescription}
      />

      <PhotoDetailModal
        photo={albumDetail.selectedPhoto}
        onClose={() => albumDetail.selectPhoto(null)}
        onDelete={albumDetail.openDeletePhotoConfirm}
      />

      <ConfirmDialog
        isOpen={albumDetail.deleteAlbumConfirm}
        onClose={albumDetail.closeDeleteAlbumConfirm}
        onConfirm={albumDetail.handleDeleteAlbum}
        title="Excluir álbum"
        message={`Tem certeza que deseja excluir o álbum "${album.title}"? Todas as fotos serão removidas. Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={albumDetail.isDeleting}
      />

      <ConfirmDialog
        isOpen={!!albumDetail.deletePhotoConfirm}
        onClose={albumDetail.closeDeletePhotoConfirm}
        onConfirm={() => albumDetail.deletePhotoConfirm && photosPagination.deletePhoto(albumDetail.deletePhotoConfirm)}
        title="Excluir foto"
        message="Tem certeza que deseja excluir esta foto? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={photosPagination.isDeleting}
      />
    </div>
  )
}
