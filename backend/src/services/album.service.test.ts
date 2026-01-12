import { describe, it, expect, vi, beforeEach } from 'vitest'
import { albumService } from './album.service.js'
import { albumRepository } from '../repositories/album.repository.js'
import * as s3Utils from '../config/s3.js'
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors.js'

vi.mock('../repositories/album.repository.js')
vi.mock('../config/s3.js')

describe('AlbumService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should create an album successfully', async () => {
      const mockAlbum = { id: '1', title: 'Test Album', userId: 'user1' }
      vi.mocked(albumRepository.create).mockResolvedValue(mockAlbum as never)

      const result = await albumService.create('user1', { title: 'Test Album' })

      expect(result.title).toBe('Test Album')
      expect(albumRepository.create).toHaveBeenCalledWith({
        title: 'Test Album',
        userId: 'user1'
      })
    })
  })

  describe('getById', () => {
    it('should return album for owner', async () => {
      const mockAlbum = {
        id: '1',
        title: 'Test',
        userId: 'user1',
        _count: { photos: 5 }
      }
      vi.mocked(albumRepository.findByIdWithPhotos).mockResolvedValue(mockAlbum as never)

      const result = await albumService.getById('user1', '1')

      expect(result.title).toBe('Test')
      expect(result.photoCount).toBe(5)
    })

    it('should throw NotFoundError for non-existent album', async () => {
      vi.mocked(albumRepository.findByIdWithPhotos).mockResolvedValue(null)

      await expect(albumService.getById('user1', 'nonexistent')).rejects.toThrow(NotFoundError)
    })

    it('should throw ForbiddenError for non-owner', async () => {
      const mockAlbum = { id: '1', userId: 'otherUser' }
      vi.mocked(albumRepository.findByIdWithPhotos).mockResolvedValue(mockAlbum as never)

      await expect(albumService.getById('user1', '1')).rejects.toThrow(ForbiddenError)
    })
  })

  describe('delete', () => {
    it('should delete album without photos', async () => {
      const mockAlbum = { id: '1', userId: 'user1' }
      vi.mocked(albumRepository.findById).mockResolvedValue(mockAlbum as never)
      vi.mocked(albumRepository.hasActivePhotos).mockResolvedValue(false)
      vi.mocked(albumRepository.softDelete).mockResolvedValue(mockAlbum as never)

      await albumService.delete('user1', '1')

      expect(albumRepository.softDelete).toHaveBeenCalledWith('1')
    })

    it('should throw BadRequestError when album has photos', async () => {
      const mockAlbum = { id: '1', userId: 'user1' }
      vi.mocked(albumRepository.findById).mockResolvedValue(mockAlbum as never)
      vi.mocked(albumRepository.hasActivePhotos).mockResolvedValue(true)

      await expect(albumService.delete('user1', '1')).rejects.toThrow(BadRequestError)
    })

    it('should throw ForbiddenError for non-owner', async () => {
      const mockAlbum = { id: '1', userId: 'otherUser' }
      vi.mocked(albumRepository.findById).mockResolvedValue(mockAlbum as never)

      await expect(albumService.delete('user1', '1')).rejects.toThrow(ForbiddenError)
    })
  })

  describe('toggleShare', () => {
    it('should enable sharing and generate token', async () => {
      const mockAlbum = { id: '1', userId: 'user1', shareToken: null }
      vi.mocked(albumRepository.findById).mockResolvedValue(mockAlbum as never)
      vi.mocked(albumRepository.update).mockResolvedValue({
        ...mockAlbum,
        isPublic: true,
        shareToken: 'generated-token'
      } as never)

      const result = await albumService.toggleShare('user1', '1', true)

      expect(result.isPublic).toBe(true)
      expect(result.shareToken).toBeTruthy()
    })

    it('should disable sharing and clear token', async () => {
      const mockAlbum = { id: '1', userId: 'user1', shareToken: 'existing' }
      vi.mocked(albumRepository.findById).mockResolvedValue(mockAlbum as never)
      vi.mocked(albumRepository.update).mockResolvedValue({
        ...mockAlbum,
        isPublic: false,
        shareToken: null
      } as never)

      const result = await albumService.toggleShare('user1', '1', false)

      expect(result.isPublic).toBe(false)
      expect(result.shareToken).toBeNull()
    })
  })

  describe('getByShareToken', () => {
    it('should return public album by share token', async () => {
      const mockAlbum = {
        id: '1',
        title: 'Shared Album',
        photos: [{ s3Key: 'key1' }],
        user: { name: 'Owner' }
      }
      vi.mocked(albumRepository.findByShareToken).mockResolvedValue(mockAlbum as never)
      vi.mocked(s3Utils.generateDownloadUrl).mockResolvedValue('https://url')

      const result = await albumService.getByShareToken('valid-token')

      expect(result.title).toBe('Shared Album')
      expect(result.ownerName).toBe('Owner')
    })

    it('should throw NotFoundError for invalid share token', async () => {
      vi.mocked(albumRepository.findByShareToken).mockResolvedValue(null)

      await expect(albumService.getByShareToken('invalid')).rejects.toThrow(NotFoundError)
    })
  })
})
