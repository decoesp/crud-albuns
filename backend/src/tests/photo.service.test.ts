import { describe, it, expect, vi, beforeEach } from 'vitest'
import { photoService } from '../services/photo.service.js'
import { photoRepository } from '../repositories/photo.repository.js'
import { albumRepository } from '../repositories/album.repository.js'
import { generateUploadUrl, generateDownloadUrl } from '../config/s3.js'
import { ForbiddenError, NotFoundError } from '../utils/errors.js'

vi.mock('../repositories/photo.repository.js')
vi.mock('../repositories/album.repository.js')
vi.mock('../config/s3.js')
vi.mock('../utils/image-analysis.js')

describe('photoService', () => {
  const mockUserId = 'user-123'
  const mockAlbumId = 'album-123'
  const mockPhotoId = 'photo-123'

  const mockAlbum = {
    id: mockAlbumId,
    userId: mockUserId,
    title: 'Test Album',
    description: null,
    isPublic: false,
    shareToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  }

  const mockPhoto = {
    id: mockPhotoId,
    albumId: mockAlbumId,
    title: 'Test Photo',
    description: null,
    filename: 'test.jpg',
    originalName: 'test.jpg',
    mimeType: 'image/jpeg',
    size: 1024,
    s3Key: 'photos/test.jpg',
    width: 1920,
    height: 1080,
    dominantColor: '#ff0000',
    acquisitionDate: new Date(),
    exifData: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateUploadUrl', () => {
    it('should generate upload URL for valid album', async () => {
      vi.mocked(albumRepository.findById).mockResolvedValue(mockAlbum)
      vi.mocked(generateUploadUrl).mockResolvedValue('https://s3.amazonaws.com/upload-url')

      const result = await photoService.generateUploadUrl(mockUserId, mockAlbumId, {
        filename: 'test.jpg',
        contentType: 'image/jpeg'
      })

      expect(result).toHaveProperty('uploadUrl')
      expect(result).toHaveProperty('key')
      expect(result).toHaveProperty('expiresIn')
      expect(albumRepository.findById).toHaveBeenCalledWith(mockAlbumId)
    })

    it('should throw NotFoundError if album does not exist', async () => {
      vi.mocked(albumRepository.findById).mockResolvedValue(null)

      await expect(
        photoService.generateUploadUrl(mockUserId, mockAlbumId, {
          filename: 'test.jpg',
          contentType: 'image/jpeg'
        })
      ).rejects.toBeInstanceOf(NotFoundError)
    })

    it('should throw ForbiddenError if user does not own album', async () => {
      vi.mocked(albumRepository.findById).mockResolvedValue({
        ...mockAlbum,
        userId: 'other-user'
      })

      await expect(
        photoService.generateUploadUrl(mockUserId, mockAlbumId, {
          filename: 'test.jpg',
          contentType: 'image/jpeg'
        })
      ).rejects.toBeInstanceOf(ForbiddenError)
    })
  })

  describe('list', () => {
    it('should list photos with URLs for valid album', async () => {
      vi.mocked(albumRepository.findById).mockResolvedValue(mockAlbum)
      vi.mocked(photoRepository.findByAlbumId).mockResolvedValue({
        photos: [mockPhoto],
        total: 1
      })
      vi.mocked(generateDownloadUrl).mockResolvedValue('https://s3.amazonaws.com/photo.jpg')

      const result = await photoService.list(mockUserId, mockAlbumId, {
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })

      expect(result.data).toHaveLength(1)
      expect(result.data[0]).toHaveProperty('url')
      expect(result.meta.total).toBe(1)
      expect(result.meta.page).toBe(1)
    })

    it('should throw NotFoundError if album does not exist', async () => {
      vi.mocked(albumRepository.findById).mockResolvedValue(null)

      await expect(
        photoService.list(mockUserId, mockAlbumId, {
          page: 1,
          limit: 20,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })
      ).rejects.toBeInstanceOf(NotFoundError)
    })

    it('should throw ForbiddenError if user does not own album', async () => {
      vi.mocked(albumRepository.findById).mockResolvedValue({
        ...mockAlbum,
        userId: 'other-user'
      })

      await expect(
        photoService.list(mockUserId, mockAlbumId, {
          page: 1,
          limit: 20,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })
      ).rejects.toBeInstanceOf(ForbiddenError)
    })
  })

  describe('getById', () => {
    it('should get photo by id with URL', async () => {
      vi.mocked(photoRepository.findByIdWithAlbum).mockResolvedValue({
        ...mockPhoto,
        album: mockAlbum
      })
      vi.mocked(generateDownloadUrl).mockResolvedValue('https://s3.amazonaws.com/photo.jpg')

      const result = await photoService.getById(mockUserId, mockAlbumId, mockPhotoId)

      expect(result).toHaveProperty('url')
      expect(result.id).toBe(mockPhotoId)
    })

    it('should throw NotFoundError if photo does not exist', async () => {
      vi.mocked(photoRepository.findByIdWithAlbum).mockResolvedValue(null)

      await expect(
        photoService.getById(mockUserId, mockAlbumId, mockPhotoId)
      ).rejects.toBeInstanceOf(NotFoundError)
    })

    it('should throw ForbiddenError if user does not own album', async () => {
      vi.mocked(photoRepository.findByIdWithAlbum).mockResolvedValue({
        ...mockPhoto,
        album: { ...mockAlbum, userId: 'other-user' }
      })

      await expect(
        photoService.getById(mockUserId, mockAlbumId, mockPhotoId)
      ).rejects.toBeInstanceOf(ForbiddenError)
    })
  })

  describe('delete', () => {
    it('should soft delete photo', async () => {
      vi.mocked(photoRepository.findByIdWithAlbum).mockResolvedValue({
        ...mockPhoto,
        album: mockAlbum
      })
      vi.mocked(photoRepository.softDelete).mockResolvedValue(mockPhoto)

      await photoService.delete(mockUserId, mockAlbumId, mockPhotoId)

      expect(photoRepository.softDelete).toHaveBeenCalledWith(mockPhotoId)
    })

    it('should throw NotFoundError if photo does not exist', async () => {
      vi.mocked(photoRepository.findByIdWithAlbum).mockResolvedValue(null)

      await expect(
        photoService.delete(mockUserId, mockAlbumId, mockPhotoId)
      ).rejects.toBeInstanceOf(NotFoundError)
    })

    it('should throw ForbiddenError if user does not own album', async () => {
      vi.mocked(photoRepository.findByIdWithAlbum).mockResolvedValue({
        ...mockPhoto,
        album: { ...mockAlbum, userId: 'other-user' }
      })

      await expect(
        photoService.delete(mockUserId, mockAlbumId, mockPhotoId)
      ).rejects.toBeInstanceOf(ForbiddenError)
    })
  })

  describe('create', () => {
    it('should create photo with metadata', async () => {
      vi.mocked(albumRepository.findById).mockResolvedValue(mockAlbum)
      vi.mocked(photoRepository.create).mockResolvedValue(mockPhoto)
      vi.mocked(generateDownloadUrl).mockResolvedValue('https://s3.amazonaws.com/photo.jpg')

      const result = await photoService.create(mockUserId, mockAlbumId, {
        title: 'Test Photo',
        filename: 'test.jpg',
        originalName: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        s3Key: 'photos/test.jpg'
      })

      expect(result).toHaveProperty('url')
      expect(photoRepository.create).toHaveBeenCalled()
    })

    it('should throw NotFoundError if album does not exist', async () => {
      vi.mocked(albumRepository.findById).mockResolvedValue(null)

      await expect(
        photoService.create(mockUserId, mockAlbumId, {
          title: 'Test Photo',
          filename: 'test.jpg',
          originalName: 'test.jpg',
          mimeType: 'image/jpeg',
          size: 1024,
          s3Key: 'photos/test.jpg'
        })
      ).rejects.toBeInstanceOf(NotFoundError)
    })

    it('should throw ForbiddenError if user does not own album', async () => {
      vi.mocked(albumRepository.findById).mockResolvedValue({
        ...mockAlbum,
        userId: 'other-user'
      })

      await expect(
        photoService.create(mockUserId, mockAlbumId, {
          title: 'Test Photo',
          filename: 'test.jpg',
          originalName: 'test.jpg',
          mimeType: 'image/jpeg',
          size: 1024,
          s3Key: 'photos/test.jpg'
        })
      ).rejects.toBeInstanceOf(ForbiddenError)
    })
  })
})
