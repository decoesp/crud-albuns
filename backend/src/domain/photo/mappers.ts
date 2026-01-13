import { Photo, Album, Prisma } from '@prisma/client'
import { PhotoEntity, PhotoWithAlbum, PhotoWithUrl, UpdatePhotoData } from './types.js'

export const toPhotoEntity = (prismaPhoto: Photo): PhotoEntity => ({
  id: prismaPhoto.id,
  title: prismaPhoto.title,
  description: prismaPhoto.description,
  filename: prismaPhoto.filename,
  originalName: prismaPhoto.originalName,
  mimeType: prismaPhoto.mimeType,
  size: prismaPhoto.size,
  width: prismaPhoto.width,
  height: prismaPhoto.height,
  dominantColor: prismaPhoto.dominantColor,
  acquisitionDate: prismaPhoto.acquisitionDate,
  exifData: prismaPhoto.exifData as Record<string, unknown> | null,
  s3Key: prismaPhoto.s3Key,
  albumId: prismaPhoto.albumId,
  createdAt: prismaPhoto.createdAt,
  updatedAt: prismaPhoto.updatedAt,
  deletedAt: prismaPhoto.deletedAt
})

export const toPhotoEntityOrNull = (prismaPhoto: Photo | null): PhotoEntity | null =>
  prismaPhoto ? toPhotoEntity(prismaPhoto) : null

interface PrismaPhotoWithAlbum extends Photo {
  album: Pick<Album, 'id' | 'userId' | 'title'>
}

export const toPhotoWithAlbum = (prismaPhoto: PrismaPhotoWithAlbum): PhotoWithAlbum => ({
  ...toPhotoEntity(prismaPhoto),
  album: {
    id: prismaPhoto.album.id,
    userId: prismaPhoto.album.userId,
    title: prismaPhoto.album.title
  }
})

export const toPhotoWithAlbumOrNull = (prismaPhoto: PrismaPhotoWithAlbum | null): PhotoWithAlbum | null =>
  prismaPhoto ? toPhotoWithAlbum(prismaPhoto) : null

export const toPhotoWithUrl = (photo: PhotoEntity, url: string): PhotoWithUrl => ({
  ...photo,
  url
})

export const toPrismaUpdateData = (data: UpdatePhotoData): Prisma.PhotoUpdateInput => {
  const updateInput: Prisma.PhotoUpdateInput = {}

  if (data.title !== undefined) updateInput.title = data.title
  if (data.description !== undefined) updateInput.description = data.description
  if (data.dominantColor !== undefined) updateInput.dominantColor = data.dominantColor
  if (data.acquisitionDate !== undefined) updateInput.acquisitionDate = data.acquisitionDate
  if (data.width !== undefined) updateInput.width = data.width
  if (data.height !== undefined) updateInput.height = data.height
  if (data.exifData !== undefined) updateInput.exifData = data.exifData as Prisma.InputJsonValue

  return updateInput
}
