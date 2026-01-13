import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Image as ImageIcon, Grid, List } from 'lucide-react'
import { usePublicAlbum } from '../features/album/hooks/useAlbumQueries'
import Modal from '../components/ui/Modal'
import { cn, formatFileSize, formatDate, getContrastColor } from '../lib/utils'
import { Photo } from '../types'

export default function PublicAlbumPage() {
  const { shareToken } = useParams<{ shareToken: string }>()
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  const { data: album, isLoading, error } = usePublicAlbum(shareToken!)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (error || !album) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Álbum não encontrado</h1>
          <p className="text-gray-600">Este álbum não existe ou não está mais disponível.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{album.title}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">{album.description}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">Compartilhado por {album.ownerName}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <span className="text-xs sm:text-sm text-gray-600">{album.photos?.length || 0} fotos</span>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button onClick={() => setViewMode('grid')} className={cn('p-2 rounded', viewMode === 'grid' ? 'bg-white shadow' : '')} aria-label="Visualização em grade">
              <Grid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('table')} className={cn('p-2 rounded', viewMode === 'table' ? 'bg-white shadow' : '')} aria-label="Visualização em tabela">
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {album.photos?.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-600">Este álbum está vazio.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {album.photos?.map((photo: Photo) => (
              <div key={photo.id} className="card cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img src={photo.url} alt={photo.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </div>
                <div className="p-2 sm:p-3">
                  <p className="text-xs sm:text-sm font-medium truncate">{photo.title}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Foto</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tamanho</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Data de aquisição</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Cor predominante</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {album.photos?.map((photo: Photo) => (
                  <tr key={photo.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={photo.url} alt={photo.title} className="w-10 h-10 object-cover rounded" />
                        <span className="text-sm">{photo.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatFileSize(photo.size)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{photo.acquisitionDate ? formatDate(photo.acquisitionDate) : '-'}</td>
                    <td className="px-4 py-3">
                      {photo.dominantColor ? (
                        <span className="inline-block px-2 py-1 rounded text-xs font-mono" style={{ backgroundColor: photo.dominantColor, color: getContrastColor(photo.dominantColor) }}>
                          {photo.dominantColor}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Modal isOpen={!!selectedPhoto} onClose={() => setSelectedPhoto(null)} title={selectedPhoto?.title} className="sm:max-w-4xl">
        {selectedPhoto && (
          <div>
            <img src={selectedPhoto.url} alt={selectedPhoto.title} className="w-full max-h-[60vh] sm:max-h-[70vh] object-contain bg-gray-100 rounded" />
            {selectedPhoto.description && <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">{selectedPhoto.description}</p>}
          </div>
        )}
      </Modal>
    </div>
  )
}
