import { v4 as uuidv4 } from 'uuid'
import { photoRepository } from '../repositories/photo.repository.js'
import { albumRepository } from '../repositories/album.repository.js'
import { generateUploadUrl, generateDownloadUrl, deleteObject, getObject } from '../config/s3.js'
import { ForbiddenError, NotFoundError } from '../utils/errors.js'
import { CreatePhotoInput, UpdatePhotoInput, ListPhotosQuery, UploadUrlInput, BatchUploadUrlInput } from '../schemas/photo.schema.js'
import { PaginatedResponse, UploadUrlResponse } from '../types/index.js'
import { extractImageMetadata, extractTitleFromFilename } from '../utils/image-analysis.js'
import { logger } from '../utils/logger.js'
import { Photo, Prisma } from '@prisma/client'
import { parseAndValidateAcquisitionDate } from '../domain/photo/validators.js'

interface PhotoWithUrl extends Photo {
  url: string
}

export const photoService = {
  async generateUploadUrl(userId: string, albumId: string, data: UploadUrlInput): Promise<UploadUrlResponse> {
    const album = await albumRepository.findById(albumId)
    if (!album) {
      throw new NotFoundError('Álbum não encontrado')
    }

    if (album.userId !== userId) {
      throw new ForbiddenError('Acesso negado')
    }

    const ext = data.filename.split('.').pop() || 'jpg'
    const key = `photos/${albumId}/${uuidv4()}.${ext}`
    const uploadUrl = await generateUploadUrl(key, data.contentType)

    return {
      uploadUrl,
      key,
      expiresIn: 3600
    }
  },

  async generateBatchUploadUrls(userId: string, albumId: string, data: BatchUploadUrlInput): Promise<UploadUrlResponse[]> {
    const album = await albumRepository.findById(albumId)
    if (!album) {
      throw new NotFoundError('Álbum não encontrado')
    }

    if (album.userId !== userId) {
      throw new ForbiddenError('Acesso negado')
    }

    const results = await Promise.all(
      data.files.map(async (file: { filename: string; contentType: string }) => {
        const ext = file.filename.split('.').pop() || 'jpg'
        const key = `photos/${albumId}/${uuidv4()}.${ext}`
        const uploadUrl = await generateUploadUrl(key, file.contentType)

        return {
          uploadUrl,
          key,
          expiresIn: 3600,
          originalFilename: file.filename
        }
      })
    )

    return results
  },

  async create(userId: string, albumId: string, data: CreatePhotoInput) {
    const album = await albumRepository.findById(albumId)
    if (!album) {
      throw new NotFoundError('Álbum não encontrado')
    }

    if (album.userId !== userId) {
      throw new ForbiddenError('Acesso negado')
    }

    const title = data.title || extractTitleFromFilename(data.originalName)
    const acquisitionDate = parseAndValidateAcquisitionDate(data.acquisitionDate as string | undefined)

    const photo = await photoRepository.create({
      ...data,
      title,
      albumId,
      acquisitionDate,
      exifData: data.exifData as Prisma.JsonValue | undefined
    })

    return {
      ...photo,
      url: await generateDownloadUrl(photo.s3Key)
    }
  },

  async processMetadata(userId: string, albumId: string, photoId: string) {
    const photo = await photoRepository.findByIdWithAlbum(photoId)
    if (!photo) {
      throw new NotFoundError('Foto não encontrada')
    }

    if (photo.album.userId !== userId) {
      throw new ForbiddenError('Acesso negado')
    }

    if (photo.albumId !== albumId) {
      throw new NotFoundError('Foto não pertence a este álbum')
    }

    try {
      const imageBuffer = await getObject(photo.s3Key)
      const metadata = await extractImageMetadata(imageBuffer)

      const updateData: Parameters<typeof photoRepository.update>[1] = {}

      if (metadata.width) updateData.width = metadata.width
      if (metadata.height) updateData.height = metadata.height
      if (metadata.dominantColor && !photo.dominantColor) {
        updateData.dominantColor = metadata.dominantColor
      }
      if (metadata.acquisitionDate && !photo.acquisitionDate) {
        updateData.acquisitionDate = new Date(metadata.acquisitionDate)
      }
      if (metadata.exifData) {
        updateData.exifData = metadata.exifData
      }

      const updatedPhoto = await photoRepository.update(photoId, updateData)

      return {
        ...updatedPhoto,
        url: await generateDownloadUrl(updatedPhoto.s3Key)
      }
    } catch (error) {
      logger.error('Error processing metadata', 'PhotoService', { error: String(error) })
      throw new Error('Falha ao processar metadados da imagem')
    }
  },

  async list(userId: string, albumId: string, query: ListPhotosQuery): Promise<PaginatedResponse<PhotoWithUrl>> {
    const album = await albumRepository.findById(albumId)
    if (!album) {
      throw new NotFoundError('Álbum não encontrado')
    }

    if (album.userId !== userId) {
      throw new ForbiddenError('Acesso negado')
    }

    const { photos, total } = await photoRepository.findByAlbumId({
      albumId,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    })

    const photosWithUrls = await Promise.all(
      photos.map(async (photo: { id: string; s3Key: string; [key: string]: unknown }) => ({
        ...photo,
        url: await generateDownloadUrl(photo.s3Key)
      }))
    )

    const totalPages = Math.ceil(total / query.limit)

    return {
      data: photosWithUrls,
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

  async getById(userId: string, albumId: string, photoId: string) {
    const photo = await photoRepository.findByIdWithAlbum(photoId)
    if (!photo) {
      throw new NotFoundError('Foto não encontrada')
    }

    if (photo.album.userId !== userId) {
      throw new ForbiddenError('Acesso negado')
    }

    if (photo.albumId !== albumId) {
      throw new NotFoundError('Foto não pertence a este álbum')
    }

    return {
      ...photo,
      url: await generateDownloadUrl(photo.s3Key)
    }
  },

  async update(userId: string, albumId: string, photoId: string, data: UpdatePhotoInput) {
    const photo = await photoRepository.findByIdWithAlbum(photoId)
    if (!photo) {
      throw new NotFoundError('Foto não encontrada')
    }

    if (photo.album.userId !== userId) {
      throw new ForbiddenError('Acesso negado')
    }

    if (photo.albumId !== albumId) {
      throw new NotFoundError('Foto não pertence a este álbum')
    }

    const acquisitionDate = data.acquisitionDate 
      ? parseAndValidateAcquisitionDate(data.acquisitionDate as string)
      : undefined

    return photoRepository.update(photoId, {
      ...data,
      acquisitionDate
    })
  },

  async delete(userId: string, albumId: string, photoId: string) {
    const photo = await photoRepository.findByIdWithAlbum(photoId)
    if (!photo) {
      throw new NotFoundError('Foto não encontrada')
    }

    if (photo.album.userId !== userId) {
      throw new ForbiddenError('Acesso negado')
    }

    if (photo.albumId !== albumId) {
      throw new NotFoundError('Foto não pertence a este álbum')
    }

    await deleteObject(photo.s3Key)
    return photoRepository.softDelete(photoId)
  }
}

