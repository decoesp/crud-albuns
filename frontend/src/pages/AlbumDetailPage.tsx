import { useState, useCallback, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { ArrowLeft, Plus, Trash2, Upload, X, Edit, Share2, ImageIcon, Loader2 } from 'lucide-react'
import { useAlbum, useUpdateAlbum, useDeleteAlbum, useToggleShareAlbum } from '../hooks/useAlbums'
import { usePhotos, useGenerateBatchUploadUrls, useCreatePhoto, useDeletePhoto, useUpdatePhoto, useProcessPhotoMetadata } from '../hooks/usePhotos'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import { cn, formatFileSize, formatDate, getContrastColor } from '../lib/utils'
import { compressImages, CompressionResult, formatCompressionStats } from '../lib/imageCompression'
import { Photo } from '../types'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([])
  const [compressedFiles, setCompressedFiles] = useState<CompressionResult[]>([])
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionStats, setCompressionStats] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [photoMetadata, setPhotoMetadata] = useState<Record<number, { title?: string; description?: string; acquisitionDate?: string; dominantColor?: string }>>({})
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const { data: album, isLoading: albumLoading } = useAlbum(id!)
  const { data: photosData, isLoading: photosLoading } = usePhotos(id!, { page, limit: 20, sortBy, sortOrder })
  const updateAlbum = useUpdateAlbum()
  const deleteAlbum = useDeleteAlbum()
  const toggleShare = useToggleShareAlbum()
  const generateUploadUrls = useGenerateBatchUploadUrls()
  const createPhoto = useCreatePhoto()
  const deletePhoto = useDeletePhoto()
  const updatePhoto = useUpdatePhoto()
  const processMetadata = useProcessPhotoMetadata()

  const [editForm, setEditForm] = useState({ title: '', description: '' })

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploadingFiles((prev) => [...prev, ...acceptedFiles])
    
    setIsCompressing(true)
    try {
      const results = await compressImages(acceptedFiles, {
        maxWidth: 2048,
        maxHeight: 2048,
        quality: 0.8,
        outputFormat: 'webp'
      })
      setCompressedFiles((prev) => [...prev, ...results])
      setCompressionStats(formatCompressionStats(results))
    } catch (error) {
      console.error('Compression failed:', error)
    } finally {
      setIsCompressing(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp', '.tiff'] },
    multiple: true
  })

  const handleUpload = async () => {
    if (compressedFiles.length === 0) return

    try {
      const filesToUpload = compressedFiles.map((r) => ({ 
        filename: r.file.name, 
        contentType: r.file.type 
      }))
      const uploadUrls = await generateUploadUrls.mutateAsync({ albumId: id!, files: filesToUpload })

      for (let i = 0; i < compressedFiles.length; i++) {
        const { file, originalSize } = compressedFiles[i]
        const urlData = uploadUrls[i]

        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }))

        await axios.put(urlData.uploadUrl, file, {
          headers: { 'Content-Type': file.type },
          onUploadProgress: (e) => {
            const progress = Math.round((e.loaded * 100) / (e.total || 1))
            setUploadProgress((prev) => ({ ...prev, [file.name]: progress }))
          }
        })

        const metadata = photoMetadata[i] || {}
        const createdPhoto = await createPhoto.mutateAsync({
          albumId: id!,
          data: {
            title: metadata.title,
            description: metadata.description,
            acquisitionDate: metadata.acquisitionDate,
            dominantColor: metadata.dominantColor,
            filename: file.name,
            originalName: uploadingFiles[i]?.name || file.name,
            mimeType: file.type,
            size: originalSize,
            s3Key: urlData.key
          }
        })

        if (!metadata.dominantColor || !metadata.acquisitionDate) {
          processMetadata.mutate({ albumId: id!, photoId: createdPhoto.id })
        }
      }

      toast.success(`${compressedFiles.length} foto(s) enviada(s) com sucesso!`)
      setUploadingFiles([])
      setCompressedFiles([])
      setCompressionStats('')
      setUploadProgress({})
      setPhotoMetadata({})
      setIsUploadModalOpen(false)
    } catch {
      toast.error('Erro ao enviar fotos')
    }
  }

  const handleDeleteAlbum = async () => {
    if (confirm('Tem certeza que deseja excluir este álbum?')) {
      try {
        await deleteAlbum.mutateAsync(id!)
        navigate('/albums')
      } catch {
        toast.error('Erro ao excluir álbum')
      }
    }
  }

  const handleShare = async () => {
    if (!album) return
    const result = await toggleShare.mutateAsync({ id: id!, isPublic: !album.isPublic })
    if (result.shareToken) {
      const shareUrl = `${window.location.origin}/public/albums/${result.shareToken}`
      navigator.clipboard.writeText(shareUrl)
      toast.success('Link copiado!')
    }
  }

  const handleEditAlbum = async () => {
    await updateAlbum.mutateAsync({ id: id!, data: editForm })
    setIsEditModalOpen(false)
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (confirm('Excluir esta foto?')) {
      await deletePhoto.mutateAsync({ albumId: id!, photoId })
    }
  }

  const sortedPhotos = useMemo(() => {
    if (!photosData?.data) return []
    return [...photosData.data]
  }, [photosData])

  if (albumLoading || photosLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!album) {
    return <div className="text-center py-12">Álbum não encontrado</div>
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Link to="/albums" className="p-2 hover:bg-gray-100 rounded-lg self-start">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{album.title}</h1>
          <p className="text-sm sm:text-base text-gray-600 line-clamp-2">{album.description || 'Sem descrição'}</p>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
          <Button variant="ghost" size="sm" onClick={() => { setEditForm({ title: album.title, description: album.description || '' }); setIsEditModalOpen(true) }} className="flex-1 sm:flex-none">
            <Edit className="w-4 h-4" />
            <span className="sm:hidden ml-2">Editar</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare} className="flex-1 sm:flex-none">
            <Share2 className={cn('w-4 h-4', album.isPublic ? 'text-green-600' : '')} />
            <span className="sm:hidden ml-2">Compartilhar</span>
          </Button>
          <Button variant="danger" size="sm" onClick={handleDeleteAlbum} className="flex-1 sm:flex-none">
            <Trash2 className="w-4 h-4" />
            <span className="sm:hidden ml-2">Excluir</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-gray-600">Visualizar:</span>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button onClick={() => setViewMode('table')} className={cn('px-3 py-1 rounded text-sm', viewMode === 'table' ? 'bg-white shadow' : '')}>
                Tabela
              </button>
              <button onClick={() => setViewMode('grid')} className={cn('px-3 py-1 rounded text-sm', viewMode === 'grid' ? 'bg-white shadow' : '')}>
                Grade
              </button>
            </div>
          </div>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => { const [s, o] = e.target.value.split('-'); setSortBy(s); setSortOrder(o as 'asc' | 'desc') }}
            className="input w-full sm:w-auto text-sm"
          >
            <option value="createdAt-desc">Mais recentes</option>
            <option value="createdAt-asc">Mais antigas</option>
            <option value="acquisitionDate-desc">Data aquisição ↓</option>
            <option value="acquisitionDate-asc">Data aquisição ↑</option>
            <option value="size-desc">Maior tamanho</option>
            <option value="size-asc">Menor tamanho</option>
          </select>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)} size="sm" className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar fotos
        </Button>
      </div>

      {sortedPhotos.length === 0 ? (
        <div className="text-center py-8 sm:py-12 card">
          <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Nenhuma foto ainda</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">Adicione fotos a este álbum.</p>
          <Button onClick={() => setIsUploadModalOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar fotos
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          {sortedPhotos.map((photo) => (
            <div key={photo.id} className="card group cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo.id) }}
                  className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 sm:p-1.5 bg-red-500 text-white rounded opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
              <div className="p-2 sm:p-3">
                <p className="text-xs sm:text-sm font-medium truncate">{photo.title}</p>
                <p className="text-xs text-gray-500">{formatFileSize(photo.size)}</p>
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
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedPhotos.map((photo) => (
                <tr key={photo.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={photo.url} alt={photo.title} className="w-10 h-10 object-cover rounded" />
                      <span className="text-sm">{photo.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatFileSize(photo.size)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {photo.acquisitionDate ? formatDate(photo.acquisitionDate) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {photo.dominantColor ? (
                      <span
                        className="inline-block px-2 py-1 rounded text-xs font-mono"
                        style={{ backgroundColor: photo.dominantColor, color: getContrastColor(photo.dominantColor) }}
                      >
                        {photo.dominantColor}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSelectedPhoto(photo)} className="p-1 hover:bg-gray-100 rounded">
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    <button onClick={() => handleDeletePhoto(photo.id)} className="p-1 hover:bg-gray-100 rounded ml-1">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {photosData && photosData.meta.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-6 sm:mt-8">
          <Button variant="secondary" size="sm" disabled={!photosData.meta.hasPrev} onClick={() => setPage((p) => p - 1)} className="w-full sm:w-auto">Anterior</Button>
          <span className="px-4 py-2 text-xs sm:text-sm text-gray-600">Página {photosData.meta.page} de {photosData.meta.totalPages}</span>
          <Button variant="secondary" size="sm" disabled={!photosData.meta.hasNext} onClick={() => setPage((p) => p + 1)} className="w-full sm:w-auto">Próxima</Button>
        </div>
      )}

      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Adicionar novas fotos" className="max-w-2xl">
        <div 
          {...getRootProps()} 
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
          )}
          role="button"
          aria-label="Área de upload de fotos. Arraste arquivos ou clique para selecionar"
          tabIndex={0}
        >
          <input {...getInputProps()} aria-label="Selecionar arquivos de imagem" />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-600">{isDragActive ? 'Solte os arquivos aqui...' : 'Arraste fotos ou clique para selecionar'}</p>
          <p className="text-sm text-gray-400 mt-2">Suporta JPG, PNG, GIF, WebP. Imagens são comprimidas automaticamente.</p>
        </div>

        {isCompressing && (
          <div className="mt-4 flex items-center justify-center gap-2 text-primary-600" role="status" aria-live="polite">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Comprimindo imagens...</span>
          </div>
        )}

        {compressionStats && !isCompressing && (
          <p className="mt-2 text-sm text-green-600 text-center" role="status">{compressionStats}</p>
        )}

        {compressedFiles.length > 0 && (
          <div className="mt-4 space-y-4 max-h-96 overflow-auto" role="list" aria-label="Lista de arquivos para upload">
            {compressedFiles.map((result, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg space-y-3" role="listitem">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium flex-1 truncate">{result.file.name}</span>
                  <span className="text-xs text-gray-500">{formatFileSize(result.compressedSize)}</span>
                  {result.compressionRatio > 0 && (
                    <span className="text-xs text-green-600">-{result.compressionRatio}%</span>
                  )}
                  {uploadProgress[result.file.name] !== undefined && (
                    <span className="text-xs text-primary-600" aria-label={`Progresso: ${uploadProgress[result.file.name]}%`}>
                      {uploadProgress[result.file.name]}%
                    </span>
                  )}
                  <button 
                    onClick={() => {
                      setCompressedFiles((f) => f.filter((_, j) => j !== i))
                      setUploadingFiles((f) => f.filter((_, j) => j !== i))
                      setPhotoMetadata((m) => {
                        const newMetadata = { ...m }
                        delete newMetadata[i]
                        return newMetadata
                      })
                    }} 
                    className="p-1 hover:bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label={`Remover ${result.file.name}`}
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input 
                    label="Título" 
                    placeholder="Deixe vazio para gerar automaticamente"
                    value={photoMetadata[i]?.title || ''}
                    onChange={(e) => setPhotoMetadata((m) => ({ ...m, [i]: { ...m[i], title: e.target.value } }))}
                  />
                  <Input 
                    label="Data/Hora de aquisição" 
                    type="datetime-local"
                    placeholder="Deixe vazio para usar data atual ou EXIF"
                    value={photoMetadata[i]?.acquisitionDate || ''}
                    onChange={(e) => setPhotoMetadata((m) => ({ ...m, [i]: { ...m[i], acquisitionDate: e.target.value } }))}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Descrição</label>
                    <textarea 
                      className="input min-h-[60px]" 
                      placeholder="Opcional"
                      value={photoMetadata[i]?.description || ''}
                      onChange={(e) => setPhotoMetadata((m) => ({ ...m, [i]: { ...m[i], description: e.target.value } }))}
                    />
                  </div>
                  <Input 
                    label="Cor predominante" 
                    type="color"
                    placeholder="Deixe vazio para extrair automaticamente"
                    value={photoMetadata[i]?.dominantColor || '#000000'}
                    onChange={(e) => setPhotoMetadata((m) => ({ ...m, [i]: { ...m[i], dominantColor: e.target.value } }))}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 justify-end mt-4">
          <Button 
            variant="secondary" 
            onClick={() => { setIsUploadModalOpen(false); setUploadingFiles([]); setCompressedFiles([]); setCompressionStats(''); setPhotoMetadata({}) }}
          >
            Fechar
          </Button>
          <Button 
            onClick={handleUpload} 
            isLoading={generateUploadUrls.isPending || createPhoto.isPending} 
            disabled={compressedFiles.length === 0 || isCompressing}
            aria-label={`Enviar ${compressedFiles.length} foto(s)`}
          >
            Enviar ({compressedFiles.length})
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar álbum">
        <div className="space-y-4">
          <Input label="Título" value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} />
          <div>
            <label className="label">Descrição</label>
            <textarea className="input min-h-[100px]" value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditAlbum} isLoading={updateAlbum.isPending}>Salvar</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!selectedPhoto} onClose={() => setSelectedPhoto(null)} title={selectedPhoto?.title} className="max-w-4xl">
        {selectedPhoto && (
          <div className="space-y-4">
            <img src={selectedPhoto.url} alt={selectedPhoto.title} className="w-full max-h-[60vh] object-contain bg-gray-100 rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-sm text-gray-500">Título:</span><p>{selectedPhoto.title}</p></div>
              <div><span className="text-sm text-gray-500">Tamanho:</span><p>{formatFileSize(selectedPhoto.size)}</p></div>
              <div><span className="text-sm text-gray-500">Data aquisição:</span><p>{selectedPhoto.acquisitionDate ? formatDate(selectedPhoto.acquisitionDate) : '-'}</p></div>
              <div><span className="text-sm text-gray-500">Cor predominante:</span><p>{selectedPhoto.dominantColor || '-'}</p></div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="danger" onClick={() => { handleDeletePhoto(selectedPhoto.id); setSelectedPhoto(null) }}>
                <Trash2 className="w-4 h-4 mr-2" />Excluir foto
              </Button>
              <Button variant="secondary" onClick={() => setSelectedPhoto(null)}>Fechar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
