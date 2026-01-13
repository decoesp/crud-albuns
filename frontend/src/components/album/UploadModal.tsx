import { useRef, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2, X } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { cn, formatFileSize } from '../../lib/utils'
import { CompressionResult } from '../../lib/imageCompression'

interface PhotoMetadataInput {
  title?: string
  description?: string
  acquisitionDate?: string
  dominantColor?: string
}

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onDrop: (files: File[]) => Promise<void>
  onUpload: () => Promise<void>
  onRemoveFile: (index: number) => void
  onUpdateMetadata: (fileKey: string, metadata: Partial<PhotoMetadataInput>) => void
  compressedFiles: CompressionResult[]
  isCompressing: boolean
  compressionStats: string
  uploadProgress: Record<string, number>
  photoMetadata: Record<string, PhotoMetadataInput>
  isUploading: boolean
}

export default function UploadModal({
  isOpen,
  onClose,
  onDrop,
  onUpload,
  onRemoveFile,
  onUpdateMetadata,
  compressedFiles,
  isCompressing,
  compressionStats,
  uploadProgress,
  photoMetadata,
  isUploading
}: UploadModalProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp', '.tiff'] },
    multiple: true,
    maxSize: 10 * 1024 * 1024,
    maxFiles: 50
  })

  const previewUrlsRef = useRef<Map<string, string>>(new Map())
  const prevFileIdsRef = useRef<string>('')

  const maxDateTime = useMemo(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }, [])

  const currentFileIds = compressedFiles.map(r => r.id).join(',')
  
  if (currentFileIds !== prevFileIdsRef.current) {
    compressedFiles.forEach((result) => {
      if (!previewUrlsRef.current.has(result.id)) {
        const url = URL.createObjectURL(result.file)
        previewUrlsRef.current.set(result.id, url)
      }
    })

    const currentIds = new Set(compressedFiles.map(r => r.id))
    previewUrlsRef.current.forEach((url, id) => {
      if (!currentIds.has(id)) {
        URL.revokeObjectURL(url)
        previewUrlsRef.current.delete(id)
      }
    })

    prevFileIdsRef.current = currentFileIds
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Adicionar novas fotos" 
      className="max-w-2xl"
    >
      {compressedFiles.length === 0 && (
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
          <p className="text-gray-600">
            {isDragActive ? 'Solte os arquivos aqui...' : 'Arraste fotos ou clique para selecionar'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Suporta JPG, PNG, GIF, WebP. Máximo 10MB por arquivo, 50 arquivos por vez.
          </p>
        </div>
      )}

      {isCompressing && (
        <div className="mt-4 flex items-center justify-center gap-2 text-primary-600" role="status" aria-live="polite">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          <span>Comprimindo imagens...</span>
        </div>
      )}

      {compressionStats && !isCompressing && (
        <p className="mt-2 text-sm text-green-600 text-center" role="status">
          {compressionStats}
        </p>
      )}

      {compressedFiles.length > 0 && (
        <>
          <div className="mt-4">
            <div
              {...getRootProps()}
              className="inline-block"
            >
              <input {...getInputProps()} />
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                aria-label="Adicionar mais fotos"
              >
                <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
                Adicionar mais fotos
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-4 max-h-[500px] overflow-auto" role="list" aria-label="Lista de arquivos para upload">
          {compressedFiles.map((result, i) => (
            <div key={result.id} className="p-4 bg-gray-50 rounded-lg space-y-3" role="listitem">
              <div className="flex items-start gap-3">
                <img
                  src={previewUrlsRef.current.get(result.id) || ''}
                  alt={`Preview de ${result.file.name}`}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium block truncate">{result.file.name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{formatFileSize(result.compressedSize)}</span>
                    {result.compressionRatio > 0 && (
                      <span className="text-xs text-green-600">-{result.compressionRatio}%</span>
                    )}
                    {uploadProgress[result.file.name] !== undefined && (
                      <span className="text-xs text-primary-600" aria-label={`Progresso: ${uploadProgress[result.file.name]}%`}>
                        {uploadProgress[result.file.name]}%
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onRemoveFile(i)}
                  className="p-1 hover:bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 flex-shrink-0"
                  aria-label={`Remover ${result.file.name}`}
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  key={`title-${result.id}`}
                  id={`title-${result.id}`}
                  label="Título"
                  placeholder="Deixe vazio para gerar automaticamente"
                  defaultValue={photoMetadata[result.id]?.title ?? ''}
                  onBlur={(e) => onUpdateMetadata(result.id, { title: e.target.value })}
                />
                <Input
                  key={`date-${result.id}`}
                  id={`date-${result.id}`}
                  label="Data/Hora de aquisição"
                  type="datetime-local"
                  max={maxDateTime}
                  placeholder="Deixe vazio para usar data atual ou EXIF"
                  defaultValue={photoMetadata[result.id]?.acquisitionDate ?? ''}
                  onChange={(e) => onUpdateMetadata(result.id, { acquisitionDate: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor={`desc-${result.id}`} className="label">Descrição</label>
                  <textarea
                    key={`desc-${result.id}`}
                    id={`desc-${result.id}`}
                    className="input min-h-[60px]"
                    placeholder="Opcional"
                    defaultValue={photoMetadata[result.id]?.description ?? ''}
                    onBlur={(e) => onUpdateMetadata(result.id, { description: e.target.value })}
                  />
                </div>
                <Input
                  key={`color-${result.id}`}
                  id={`color-${result.id}`}
                  label="Cor predominante"
                  type="color"
                  placeholder="Deixe vazio para extrair automaticamente"
                  defaultValue={photoMetadata[result.id]?.dominantColor ?? '#000000'}
                  onChange={(e) => onUpdateMetadata(result.id, { dominantColor: e.target.value })}
                />
              </div>
            </div>
          ))}
          </div>
        </>
      )}

      <div className="flex gap-3 justify-end mt-4">
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
        <Button
          onClick={onUpload}
          isLoading={isUploading}
          disabled={compressedFiles.length === 0 || isCompressing}
          aria-label={`Enviar ${compressedFiles.length} foto(s)`}
        >
          Enviar ({compressedFiles.length})
        </Button>
      </div>
    </Modal>
  )
}
