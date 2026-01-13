import { Album, Photo } from '@prisma/client'
import { AlbumEntity, AlbumWithPhotos, AlbumListItem, PhotoSummary } from './types.js'

export const toAlbumEntity = (prismaAlbum: Album): AlbumEntity => ({
  id: prismaAlbum.id,
  title: prismaAlbum.title,
  description: prismaAlbum.description,
  userId: prismaAlbum.userId,
  shareToken: prismaAlbum.shareToken,
  isPublic: prismaAlbum.isPublic,
  createdAt: prismaAlbum.createdAt,
  updatedAt: prismaAlbum.updatedAt,
  deletedAt: prismaAlbum.deletedAt
})

export const toAlbumEntityOrNull = (prismaAlbum: Album | null): AlbumEntity | null =>
  prismaAlbum ? toAlbumEntity(prismaAlbum) : null

interface PrismaAlbumWithPhotosAndCount extends Album {
  photos: Pick<Photo, 'id' | 's3Key'>[]
  _count: { photos: number }
}

export const toAlbumWithPhotos = (prismaAlbum: PrismaAlbumWithPhotosAndCount): AlbumWithPhotos => ({
  ...toAlbumEntity(prismaAlbum),
  photos: prismaAlbum.photos.map(toPhotoSummary),
  photoCount: prismaAlbum._count.photos
})

export const toPhotoSummary = (photo: Pick<Photo, 'id' | 's3Key'>): PhotoSummary => ({
  id: photo.id,
  s3Key: photo.s3Key
})

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
