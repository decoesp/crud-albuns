import { X } from 'lucide-react'
import { formatFileSize } from '../../lib/utils'

interface FilePreviewProps {
  id: string
  fileName: string
  previewUrl: string
  compressedSize: number
  compressionRatio: number
  uploadProgress?: number
  onRemove: () => void
}

export default function FilePreview({
  id,
  fileName,
  previewUrl,
  compressedSize,
  compressionRatio,
  uploadProgress,
  onRemove
}: FilePreviewProps) {
  return (
    <div className="flex items-start gap-3">
      <img
        src={previewUrl}
        alt={`Preview de ${fileName}`}
        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium block truncate">{fileName}</span>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">{formatFileSize(compressedSize)}</span>
          {compressionRatio > 0 && (
            <span className="text-xs text-green-600">-{compressionRatio}%</span>
          )}
          {uploadProgress !== undefined && (
            <span className="text-xs text-primary-600" aria-label={`Progresso: ${uploadProgress}%`}>
              {uploadProgress}%
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onRemove}
        className="p-1 hover:bg-gray-200 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 flex-shrink-0"
        aria-label={`Remover ${fileName}`}
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  )
}
