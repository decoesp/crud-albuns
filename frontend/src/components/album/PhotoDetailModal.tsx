import { Trash2 } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Photo } from '../../types'
import { formatFileSize, formatDate } from '../../lib/utils'

interface PhotoDetailModalProps {
  photo: Photo | null
  onClose: () => void
  onDelete: (photoId: string) => void
}

export default function PhotoDetailModal({ photo, onClose, onDelete }: PhotoDetailModalProps) {
  if (!photo) return null

  return (
    <Modal 
      isOpen={!!photo} 
      onClose={onClose} 
      title={photo.title} 
      className="max-w-4xl"
    >
      <div className="space-y-4">
        <img
          src={photo.url}
          alt={photo.title}
          className="w-full max-h-[60vh] object-contain bg-gray-100 rounded"
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500">Título:</span>
            <p>{photo.title}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Tamanho:</span>
            <p>{formatFileSize(photo.size)}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Data aquisição:</span>
            <p>{photo.acquisitionDate ? formatDate(photo.acquisitionDate) : '-'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Cor predominante:</span>
            <p>{photo.dominantColor || '-'}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button
            variant="danger"
            onClick={() => {
              onDelete(photo.id)
              onClose()
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
            Excluir foto
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
