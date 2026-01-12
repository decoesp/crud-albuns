import { v4 as uuidv4 } from 'uuid'
import { albumRepository } from '../repositories/album.repository.js'
import { generateDownloadUrl } from '../config/s3.js'
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors.js'
import { CreateAlbumInput, UpdateAlbumInput, ListAlbumsQuery } from '../schemas/album.schema.js'
import { PaginatedResponse } from '../types/index.js'

export const albumService = {
  async create(userId: string, data: CreateAlbumInput) {
    const album = await albumRepository.create({
      ...data,
      userId
    })

    return album
  },

  async list(userId: string, query: ListAlbumsQuery): Promise<PaginatedResponse<unknown>> {
    const { albums, total } = await albumRepository.findByUserId({
      userId,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      search: query.search
    })

    const albumsWithCover = await Promise.all(
      albums.map(async (album) => {
        let coverUrl = null
        if (album.photos[0]?.s3Key) {
          coverUrl = await generateDownloadUrl(album.photos[0].s3Key)
        }
        return {
          id: album.id,
          title: album.title,
          description: album.description,
          photoCount: album._count.photos,
          coverUrl,
          isPublic: album.isPublic,
          shareToken: album.shareToken,
          createdAt: album.createdAt,
          updatedAt: album.updatedAt
        }
      })
    )

    const totalPages = Math.ceil(total / query.limit)

    return {
      data: albumsWithCover,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
        hasNext: query.page < totalPages,
        hasPrev: query.page > 1
      }
    }
  },

  async getById(userId: string, albumId: string) {
    const album = await albumRepository.findByIdWithPhotos(albumId)
    if (!album) {
      throw new NotFoundError('Álbum não encontrado')
    }

    if (album.userId !== userId) {
      throw new ForbiddenError('Acesso negado')
    }

    return {
      id: album.id,
      title: album.title,
      description: album.description,
      photoCount: album._count.photos,
      isPublic: album.isPublic,
      shareToken: album.shareToken,
      createdAt: album.createdAt,
      updatedAt: album.updatedAt
    }
  },

  async getByShareToken(shareToken: string) {
    const album = await albumRepository.findByShareToken(shareToken)
    if (!album) {
      throw new NotFoundError('Álbum não encontrado ou não é público')
    }

    const photosWithUrls = await Promise.all(
      album.photos.map(async (photo) => ({
        ...photo,
        url: await generateDownloadUrl(photo.s3Key)
      }))
    )

    return {
      id: album.id,
      title: album.title,
      description: album.description,
      ownerName: album.user.name,
      photos: photosWithUrls
    }
  },

  async update(userId: string, albumId: string, data: UpdateAlbumInput) {
    const album = await albumRepository.findById(albumId)
    if (!album) {
      throw new NotFoundError('Álbum não encontrado')
    }

    if (album.userId !== userId) {
      throw new ForbiddenError('Acesso negado')
    }

    return albumRepository.update(albumId, data)
  },

  async delete(userId: string, albumId: string) {
    const album = await albumRepository.findById(albumId)
    if (!album) {
      throw new NotFoundError('Álbum não encontrado')
    }

    if (album.userId !== userId) {
      throw new ForbiddenError('Acesso negado')
    }

    const hasPhotos = await albumRepository.hasActivePhotos(albumId)
    if (hasPhotos) {
      throw new BadRequestError('Não é possível excluir um álbum que contém fotos. Remova todas as fotos primeiro.')
    }

    return albumRepository.softDelete(albumId)
  },

  async toggleShare(userId: string, albumId: string, isPublic: boolean) {
    const album = await albumRepository.findById(albumId)
    if (!album) {
      throw new NotFoundError('Álbum não encontrado')
    }

    if (album.userId !== userId) {
      throw new ForbiddenError('Acesso negado')
    }

    const shareToken = isPublic ? (album.shareToken || uuidv4()) : null

    const updatedAlbum = await albumRepository.update(albumId, {
      isPublic,
      shareToken
    })

    return {
      isPublic: updatedAlbum.isPublic,
      shareToken: updatedAlbum.shareToken
    }
  }
}
