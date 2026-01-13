import { describe, it, expect } from 'vitest'
import {
  ensureAlbumExists,
  ensureAlbumOwnership,
  ensureCanDeleteAlbum,
  toAlbumListItem,
  toAlbumDetail,
  buildShareUpdate,
  toShareResult,
  buildPaginationMeta,
  buildPaginatedResponse
} from './operations.js'
import { NotFoundError, ForbiddenError, BadRequestError } from '../../utils/errors.js'
import { AlbumWithPhotos } from './types.js'

describe('Album Domain Operations', () => {
  const createMockAlbum = (overrides: Partial<AlbumWithPhotos> = {}): AlbumWithPhotos => ({
    id: 'album-1',
    title: 'Test Album',
    description: 'Test Description',
    userId: 'user-1',
    shareToken: null,
    isPublic: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    deletedAt: null,
    photos: [],
    photoCount: 0,
    ...overrides
  })

  describe('ensureAlbumExists', () => {
    it('should return the album when it exists', () => {
      const album = createMockAlbum()
      
      const result = ensureAlbumExists(album)
      
      expect(result).toBe(album)
    })

    it('should throw NotFoundError when album is null', () => {
      expect(() => ensureAlbumExists(null)).toThrow(NotFoundError)
    })

    it('should throw NotFoundError when album is undefined', () => {
      expect(() => ensureAlbumExists(undefined)).toThrow(NotFoundError)
    })

    it('should use custom message when provided', () => {
      expect(() => ensureAlbumExists(null, 'Custom message'))
        .toThrow('Custom message')
    })
  })

  describe('ensureAlbumOwnership', () => {
    it('should return the album when user is owner', () => {
      const album = createMockAlbum({ userId: 'user-1' })
      
      const result = ensureAlbumOwnership(album, 'user-1')
      
      expect(result).toBe(album)
    })

    it('should throw ForbiddenError when user is not owner', () => {
      const album = createMockAlbum({ userId: 'user-1' })
      
      expect(() => ensureAlbumOwnership(album, 'user-2')).toThrow(ForbiddenError)
    })

    it('should throw with correct message', () => {
      const album = createMockAlbum({ userId: 'user-1' })
      
      expect(() => ensureAlbumOwnership(album, 'user-2')).toThrow('Acesso negado')
    })
  })

  describe('ensureCanDeleteAlbum', () => {
    it('should not throw when album has no photos', () => {
      expect(() => ensureCanDeleteAlbum(false)).not.toThrow()
    })

    it('should throw BadRequestError when album has photos', () => {
      expect(() => ensureCanDeleteAlbum(true)).toThrow(BadRequestError)
    })

    it('should throw with correct message', () => {
      expect(() => ensureCanDeleteAlbum(true))
        .toThrow('Não é possível excluir um álbum que contém fotos')
    })
  })

  describe('toAlbumListItem', () => {
    it('should transform album to list item with cover', () => {
      const album = createMockAlbum({ photoCount: 5 })
      const coverUrl = 'https://example.com/cover.jpg'
      
      const result = toAlbumListItem(album, coverUrl)
      
      expect(result).toEqual({
        id: 'album-1',
        title: 'Test Album',
        description: 'Test Description',
        photoCount: 5,
        coverUrl: 'https://example.com/cover.jpg',
        isPublic: false,
        shareToken: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02')
      })
    })

    it('should handle null cover URL', () => {
      const album = createMockAlbum()
      
      const result = toAlbumListItem(album, null)
      
      expect(result.coverUrl).toBeNull()
    })
  })

  describe('toAlbumDetail', () => {
    it('should transform album to detail view', () => {
      const album = createMockAlbum({
        photoCount: 10,
        isPublic: true,
        shareToken: 'share-token-123'
      })
      
      const result = toAlbumDetail(album)
      
      expect(result).toEqual({
        id: 'album-1',
        title: 'Test Album',
        description: 'Test Description',
        photoCount: 10,
        isPublic: true,
        shareToken: 'share-token-123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02')
      })
    })
  })

  describe('buildShareUpdate', () => {
    it('should generate new token when enabling share without existing token', () => {
      const generateToken = () => 'new-token'
      
      const result = buildShareUpdate(true, null, generateToken)
      
      expect(result).toEqual({
        isPublic: true,
        shareToken: 'new-token'
      })
    })

    it('should keep existing token when enabling share with existing token', () => {
      const generateToken = () => 'new-token'
      
      const result = buildShareUpdate(true, 'existing-token', generateToken)
      
      expect(result).toEqual({
        isPublic: true,
        shareToken: 'existing-token'
      })
    })

    it('should clear token when disabling share', () => {
      const generateToken = () => 'new-token'
      
      const result = buildShareUpdate(false, 'existing-token', generateToken)
      
      expect(result).toEqual({
        isPublic: false,
        shareToken: null
      })
    })
  })

  describe('toShareResult', () => {
    it('should extract share info from album', () => {
      const album = { isPublic: true, shareToken: 'token-123' }
      
      const result = toShareResult(album)
      
      expect(result).toEqual({
        isPublic: true,
        shareToken: 'token-123'
      })
    })
  })

  describe('buildPaginationMeta', () => {
    it('should calculate pagination correctly', () => {
      const result = buildPaginationMeta(100, 2, 10)
      
      expect(result).toEqual({
        total: 100,
        page: 2,
        limit: 10,
        totalPages: 10,
        hasNext: true,
        hasPrev: true
      })
    })

    it('should handle first page', () => {
      const result = buildPaginationMeta(50, 1, 10)
      
      expect(result.hasPrev).toBe(false)
      expect(result.hasNext).toBe(true)
    })

    it('should handle last page', () => {
      const result = buildPaginationMeta(50, 5, 10)
      
      expect(result.hasPrev).toBe(true)
      expect(result.hasNext).toBe(false)
    })

    it('should handle single page', () => {
      const result = buildPaginationMeta(5, 1, 10)
      
      expect(result.totalPages).toBe(1)
      expect(result.hasPrev).toBe(false)
      expect(result.hasNext).toBe(false)
    })

    it('should handle empty results', () => {
      const result = buildPaginationMeta(0, 1, 10)
      
      expect(result.totalPages).toBe(0)
      expect(result.hasNext).toBe(false)
    })
  })

  describe('buildPaginatedResponse', () => {
    it('should build complete paginated response', () => {
      const data = [{ id: '1' }, { id: '2' }]
      
      const result = buildPaginatedResponse(data, 20, 1, 10)
      
      expect(result).toEqual({
        data,
        meta: {
          total: 20,
          page: 1,
          limit: 10,
          totalPages: 2,
          hasNext: true,
          hasPrev: false
        }
      })
    })
  })
})
