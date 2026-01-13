import { Link } from 'react-router-dom'
import { Share2, Trash2, Image as ImageIcon } from 'lucide-react'
import Button from '../ui/Button'
import { Album } from '../../types'

interface AlbumCardProps {
  album: Album
  onShare: (album: Album) => void
  onDelete: (album: Album) => void
}

export default function AlbumCard({ album, onShare, onDelete }: AlbumCardProps) {
  return (
    <div className="card overflow-hidden">
      <Link to={`/albums/${album.id}`}>
        <div className="aspect-video bg-gray-100 overflow-hidden">
          {album.coverUrl ? (
            <img
              src={album.coverUrl}
              alt={album.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-300" aria-hidden="true" />
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/albums/${album.id}`}>
          <h3 className="font-semibold text-lg mb-1 hover:text-primary-600 transition-colors">
            {album.title}
          </h3>
        </Link>
        {album.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{album.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{album.photoCount} fotos</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onShare(album)}
              aria-label={album.isPublic ? 'Desativar compartilhamento' : 'Compartilhar álbum'}
            >
              <Share2 className={`w-4 h-4 ${album.isPublic ? 'text-primary-600' : ''}`} aria-hidden="true" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(album)}
              aria-label={`Excluir álbum ${album.title}`}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
