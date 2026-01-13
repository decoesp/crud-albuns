import { Link } from 'react-router-dom'
import { Share2, Trash2, Image as ImageIcon } from 'lucide-react'
import Button from '../ui/Button'
import { Album } from '../../types'
import { formatDate } from '../../lib/utils'

interface AlbumListItemProps {
  album: Album
  onShare: (album: Album) => void
  onDelete: (album: Album) => void
}

export default function AlbumListItem({ album, onShare, onDelete }: AlbumListItemProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
            {album.coverUrl ? (
              <img
                src={album.coverUrl}
                alt={album.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-gray-300" aria-hidden="true" />
              </div>
            )}
          </div>
          <div>
            <Link
              to={`/albums/${album.id}`}
              className="font-medium hover:text-primary-600 transition-colors"
            >
              {album.title}
            </Link>
            {album.description && (
              <p className="text-sm text-gray-500 line-clamp-1">{album.description}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{album.photoCount}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(album.createdAt)}</td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            album.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {album.isPublic ? 'Público' : 'Privado'}
        </span>
      </td>
      <td className="px-6 py-4">
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
      </td>
    </tr>
  )
}
