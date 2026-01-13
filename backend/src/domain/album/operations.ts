import { AlbumWithPhotos, AlbumListItem } from './types.js'
import { ForbiddenError, NotFoundError, BadRequestError } from '../../utils/errors.js'

export const ensureAlbumExists = <T>(
  album: T | null | undefined,
  message = 'Álbum não encontrado'
): T => {
  if (!album) {
    throw new NotFoundError(message)
  }
  return album
}

export const ensureAlbumOwnership = <T extends { userId: string }>(
  album: T,
  userId: string
): T => {
  if (album.userId !== userId) {
    throw new ForbiddenError('Acesso negado')
  }
  return album
}

export const ensureCanDeleteAlbum = (hasPhotos: boolean): void => {
  if (hasPhotos) {
    throw new BadRequestError(
      'Não é possível excluir um álbum que contém fotos. Remova todas as fotos primeiro.'
    )
  }
}

export const toAlbumListItem = (
  album: AlbumWithPhotos,
  coverUrl: string | null
): AlbumListItem => ({
  id: album.id,
  title: album.title,
  description: album.description,
  photoCount: album.photoCount,
  coverUrl,
  isPublic: album.isPublic,
  shareToken: album.shareToken,
  createdAt: album.createdAt,
  updatedAt: album.updatedAt
})

export const toAlbumDetail = (album: AlbumWithPhotos) => ({
  id: album.id,
  title: album.title,
  description: album.description,
  photoCount: album.photoCount,
  isPublic: album.isPublic,
  shareToken: album.shareToken,
  createdAt: album.createdAt,
  updatedAt: album.updatedAt
})

export const buildShareUpdate = (
  isPublic: boolean,
  existingToken: string | null,
  generateToken: () => string
) => ({
  isPublic,
  shareToken: isPublic ? (existingToken || generateToken()) : null
})

export const toShareResult = (album: { isPublic: boolean; shareToken: string | null }) => ({
  isPublic: album.isPublic,
  shareToken: album.shareToken
})

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit)
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  }
}

export const buildPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) => ({
  data,
  meta: buildPaginationMeta(total, page, limit)
})
