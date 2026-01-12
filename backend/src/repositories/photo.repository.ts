import prisma from '../config/database.js'
import { Photo, Prisma } from '@prisma/client'

export interface CreatePhotoData {
  title: string
  description?: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  width?: number
  height?: number
  dominantColor?: string
  acquisitionDate?: Date
  exifData?: Prisma.JsonValue
  s3Key: string
  albumId: string
}

export interface UpdatePhotoData {
  title?: string
  description?: string
  dominantColor?: string
  acquisitionDate?: Date
}

export interface ListPhotosParams {
  albumId: string
  page: number
  limit: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export const photoRepository = {
  async findById(id: string): Promise<Photo | null> {
    return prisma.photo.findFirst({
      where: { id, deletedAt: null }
    })
  },

  async findByIdWithAlbum(id: string) {
    return prisma.photo.findFirst({
      where: { id, deletedAt: null },
      include: {
        album: {
          select: { id: true, userId: true, title: true }
        }
      }
    })
  },

  async findByAlbumId(params: ListPhotosParams) {
    const { albumId, page, limit, sortBy, sortOrder } = params
    const skip = (page - 1) * limit

    const where: Prisma.PhotoWhereInput = {
      albumId,
      deletedAt: null
    }

    const [photos, total] = await Promise.all([
      prisma.photo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.photo.count({ where })
    ])

    return { photos, total }
  },

  async create(data: CreatePhotoData): Promise<Photo> {
    return prisma.photo.create({ data })
  },

  async createMany(data: CreatePhotoData[]): Promise<number> {
    const result = await prisma.photo.createMany({ data })
    return result.count
  },

  async update(id: string, data: UpdatePhotoData): Promise<Photo> {
    return prisma.photo.update({
      where: { id },
      data
    })
  },

  async softDelete(id: string): Promise<Photo> {
    return prisma.photo.update({
      where: { id },
      data: { deletedAt: new Date() }
    })
  },

  async belongsToAlbum(id: string, albumId: string): Promise<boolean> {
    const photo = await prisma.photo.findFirst({
      where: { id, albumId, deletedAt: null }
    })
    return !!photo
  }
}
