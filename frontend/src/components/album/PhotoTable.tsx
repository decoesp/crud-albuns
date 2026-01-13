import { Edit, Trash2 } from 'lucide-react'
import { Photo } from '../../types'
import { formatFileSize, formatDate, getContrastColor } from '../../lib/utils'

interface PhotoTableProps {
  photos: Photo[]
  onPhotoClick: (photo: Photo) => void
  onDeleteClick: (photoId: string) => void
}

export default function PhotoTable({ photos, onPhotoClick, onDeleteClick }: PhotoTableProps) {
  return (
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
          {photos.map((photo) => (
            <tr key={photo.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={photo.url} 
                    alt={photo.title} 
                    className="w-10 h-10 object-cover rounded"
                    loading="lazy"
                  />
                  <span className="text-sm">{photo.title}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {formatFileSize(photo.size)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {photo.acquisitionDate ? formatDate(photo.acquisitionDate) : '-'}
              </td>
              <td className="px-4 py-3">
                {photo.dominantColor ? (
                  <span
                    className="inline-block px-2 py-1 rounded text-xs font-mono"
                    style={{ 
                      backgroundColor: photo.dominantColor, 
                      color: getContrastColor(photo.dominantColor) 
                    }}
                  >
                    {photo.dominantColor}
                  </span>
                ) : '-'}
              </td>
              <td className="px-4 py-3 text-right">
                <button 
                  onClick={() => onPhotoClick(photo)} 
                  className="p-1 hover:bg-gray-100 rounded"
                  aria-label={`Editar foto ${photo.title}`}
                >
                  <Edit className="w-4 h-4 text-gray-500" aria-hidden="true" />
                </button>
                <button
                  onClick={() => onDeleteClick(photo.id)}
                  className="p-1 hover:bg-gray-100 rounded ml-1"
                  aria-label={`Excluir foto ${photo.title}`}
                >
                  <Trash2 className="w-4 h-4 text-red-500" aria-hidden="true" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
