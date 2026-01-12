import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Grid, List, Share2, Trash2, Edit, Image as ImageIcon } from 'lucide-react'
import { useAlbums, useCreateAlbum, useDeleteAlbum, useToggleShareAlbum } from '../hooks/useAlbums'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '../lib/utils'
import toast from 'react-hot-toast'

const createAlbumSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200),
  description: z.string().max(2000).optional()
})

type CreateAlbumForm = z.infer<typeof createAlbumSchema>

export default function AlbumsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useAlbums({ page, limit: 12 })
  const createAlbum = useCreateAlbum()
  const deleteAlbum = useDeleteAlbum()
  const toggleShare = useToggleShareAlbum()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateAlbumForm>({
    resolver: zodResolver(createAlbumSchema)
  })

  const onCreateSubmit = async (formData: CreateAlbumForm) => {
    await createAlbum.mutateAsync(formData)
    setIsCreateModalOpen(false)
    reset()
  }

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Tem certeza que deseja excluir o álbum "${title}"?`)) {
      await deleteAlbum.mutateAsync(id)
    }
  }

  const handleShare = async (id: string, isPublic: boolean) => {
    const result = await toggleShare.mutateAsync({ id, isPublic: !isPublic })
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
            <div key={album.id} className="card group">
              <Link to={`/albums/${album.id}`}>
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {album.coverUrl ? (
                    <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  {album.isPublic && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Público
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/albums/${album.id}`}>
                  <h3 className="font-semibold text-gray-900 truncate">{album.title}</h3>
                  <p className="text-sm text-gray-500 truncate">{album.description || 'Sem descrição'}</p>
                  <p className="text-xs text-gray-400 mt-1">{album.photoCount} fotos</p>
                </Link>
                <div className="flex items-center gap-2 mt-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleShare(album.id, album.isPublic)}
                    className="p-1.5 hover:bg-gray-100 rounded"
                    title={album.isPublic ? 'Desativar compartilhamento' : 'Compartilhar'}
                  >
                    <Share2 className={cn('w-4 h-4', album.isPublic ? 'text-green-600' : 'text-gray-500')} />
                  </button>
                  <Link to={`/albums/${album.id}`} className="p-1.5 hover:bg-gray-100 rounded">
                    <Edit className="w-4 h-4 text-gray-500" />
                  </Link>
                  <button
                    onClick={() => handleDelete(album.id, album.title)}
                    className="p-1.5 hover:bg-gray-100 rounded"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card divide-y">
          {data?.data.map((album) => (
            <div key={album.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50">
              <Link to={`/albums/${album.id}`} className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {album.coverUrl ? (
                  <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/albums/${album.id}`}>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">{album.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{album.description || 'Sem descrição'}</p>
                  <p className="text-xs text-gray-400 mt-1">{album.photoCount} fotos</p>
                </Link>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {album.isPublic && (
                  <span className="hidden sm:inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Público</span>
                )}
                <button onClick={() => handleShare(album.id, album.isPublic)} className="p-2 hover:bg-gray-100 rounded">
                  <Share2 className={cn('w-4 h-4', album.isPublic ? 'text-green-600' : 'text-gray-500')} />
                </button>
                <button onClick={() => handleDelete(album.id, album.title)} className="p-2 hover:bg-gray-100 rounded">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
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

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Criar novo álbum">
        <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
          <Input id="title" label="Título" placeholder="Nome do álbum" error={errors.title?.message} {...register('title')} />
          <div>
            <label className="label">Descrição</label>
            <textarea
              className="input min-h-[100px]"
              placeholder="Descrição do álbum (opcional)"
              {...register('description')}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Fechar
            </Button>
            <Button type="submit" isLoading={createAlbum.isPending}>
              Concluir
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
