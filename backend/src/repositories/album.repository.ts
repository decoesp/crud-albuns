import prisma from '../config/database.js'
import { Album, Prisma } from '@prisma/client'

export interface CreateAlbumData {
  title: string
  description?: string
  userId: string
}

export interface UpdateAlbumData {
  title?: string
  description?: string
  shareToken?: string | null
  isPublic?: boolean
}

export interface ListAlbumsParams {
  userId: string
  page: number
  limit: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  search?: string
}

export const albumRepository = {
  async findById(id: string): Promise<Album | null> {
    return prisma.album.findFirst({
      where: { id, deletedAt: null }
    })
  },

  async findByIdWithPhotos(id: string) {
    return prisma.album.findFirst({
      where: { id, deletedAt: null },
      include: {
        photos: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { photos: { where: { deletedAt: null } } }
        }
      }
    })
  },

  async findByShareToken(shareToken: string) {
    return prisma.album.findFirst({
      where: { shareToken, isPublic: true, deletedAt: null },
      include: {
        photos: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' }
        },
        user: {
          select: { name: true }
        }
      }
    })
  },

  async findByUserId(params: ListAlbumsParams) {
    const { userId, page, limit, sortBy, sortOrder, search } = params
    const skip = (page - 1) * limit

    const where: Prisma.AlbumWhereInput = {
      userId,
      deletedAt: null,
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } }
        ]
      })
    }

    const [albums, total] = await Promise.all([
      prisma.album.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { photos: { where: { deletedAt: null } } }
          },
          photos: {
            where: { deletedAt: null },
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { s3Key: true }
          }
        }
      }),
      prisma.album.count({ where })
    ])

    return { albums, total }
  },

  async create(data: CreateAlbumData): Promise<Album> {
    return prisma.album.create({ data })
  },

  async update(id: string, data: UpdateAlbumData): Promise<Album> {
    return prisma.album.update({
      where: { id },
      data
    })
  },

  async softDelete(id: string): Promise<Album> {
    return prisma.album.update({
      where: { id },
      data: { deletedAt: new Date() }
    })
  },

  async hasActivePhotos(id: string): Promise<boolean> {
    const count = await prisma.photo.count({
      where: { albumId: id, deletedAt: null }
    })
    return count > 0
  },

  async belongsToUser(id: string, userId: string): Promise<boolean> {
    const album = await prisma.album.findFirst({
      where: { id, userId, deletedAt: null }
    })
    return !!album
  }
}
