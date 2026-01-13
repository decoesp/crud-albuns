import { Trash2 } from 'lucide-react'
import { Photo } from '../../types'
import { formatFileSize } from '../../lib/utils'

interface PhotoGridProps {
  photos: Photo[]
  onPhotoClick: (photo: Photo) => void
  onDeleteClick: (photoId: string) => void
}

export default function PhotoGrid({ photos, onPhotoClick, onDeleteClick }: PhotoGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
      {photos.map((photo) => (
        <div 
          key={photo.id} 
          className="card group cursor-pointer" 
          onClick={() => onPhotoClick(photo)}
        >
          <div className="aspect-square bg-gray-100 relative overflow-hidden">
            <img 
              src={photo.url} 
              alt={photo.title} 
              className="w-full h-full object-cover" 
              loading="lazy"
            />
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteClick(photo.id) }}
              className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 sm:p-1.5 bg-red-500 text-white rounded opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              aria-label={`Excluir foto ${photo.title}`}
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
            </button>
          </div>
          <div className="p-2 sm:p-3">
            <p className="text-xs sm:text-sm font-medium truncate">{photo.title}</p>
            <p className="text-xs text-gray-500">{formatFileSize(photo.size)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
