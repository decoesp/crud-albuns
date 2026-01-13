import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { albumApi } from './albumApi'
import api from '../../../lib/api'

vi.mock('../../../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

const mockedApi = api as unknown as {
  get: Mock
  post: Mock
  patch: Mock
  delete: Mock
}

describe('albumApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('should call GET /albums with params', async () => {
      const mockResponse = {
        data: {
          data: [{ id: '1', title: 'Album 1' }],
          meta: { total: 1, page: 1, limit: 10 }
        }
      }
      mockedApi.get.mockResolvedValue(mockResponse)

      const result = await albumApi.list({ page: 1, limit: 10, search: 'test' })

      expect(mockedApi.get).toHaveBeenCalledWith('/albums', {
        params: { page: 1, limit: 10, search: 'test' }
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getById', () => {
    it('should call GET /albums/:id', async () => {
      const mockAlbum = { id: 'album-1', title: 'Test Album' }
      mockedApi.get.mockResolvedValue({ data: mockAlbum })

      const result = await albumApi.getById('album-1')

      expect(mockedApi.get).toHaveBeenCalledWith('/albums/album-1')
      expect(result).toEqual(mockAlbum)
    })
  })

  describe('create', () => {
    it('should call POST /albums with data', async () => {
      const newAlbum = { title: 'New Album', description: 'Description' }
      const createdAlbum = { id: 'new-id', ...newAlbum }
      mockedApi.post.mockResolvedValue({ data: createdAlbum })

      const result = await albumApi.create(newAlbum)

      expect(mockedApi.post).toHaveBeenCalledWith('/albums', newAlbum)
      expect(result).toEqual(createdAlbum)
    })
  })

  describe('update', () => {
    it('should call PATCH /albums/:id with data', async () => {
      const updateData = { title: 'Updated Title' }
      const updatedAlbum = { id: 'album-1', title: 'Updated Title' }
      mockedApi.patch.mockResolvedValue({ data: updatedAlbum })

      const result = await albumApi.update('album-1', updateData)

      expect(mockedApi.patch).toHaveBeenCalledWith('/albums/album-1', updateData)
      expect(result).toEqual(updatedAlbum)
    })
  })

  describe('delete', () => {
    it('should call DELETE /albums/:id', async () => {
      mockedApi.delete.mockResolvedValue({})

      await albumApi.delete('album-1')

      expect(mockedApi.delete).toHaveBeenCalledWith('/albums/album-1')
    })
  })

  describe('toggleShare', () => {
    it('should call POST /albums/:id/share with isPublic true', async () => {
      const shareResult = { isPublic: true, shareToken: 'token-123' }
      mockedApi.post.mockResolvedValue({ data: shareResult })

      const result = await albumApi.toggleShare('album-1', true)

      expect(mockedApi.post).toHaveBeenCalledWith('/albums/album-1/share', { isPublic: true })
      expect(result).toEqual(shareResult)
    })

    it('should call POST /albums/:id/share with isPublic false', async () => {
      const shareResult = { isPublic: false, shareToken: null }
      mockedApi.post.mockResolvedValue({ data: shareResult })

      const result = await albumApi.toggleShare('album-1', false)

      expect(mockedApi.post).toHaveBeenCalledWith('/albums/album-1/share', { isPublic: false })
      expect(result).toEqual(shareResult)
    })
  })

  describe('getByShareToken', () => {
    it('should call GET /public/albums/:shareToken', async () => {
      const publicAlbum = { id: 'album-1', title: 'Public Album', photos: [] }
      mockedApi.get.mockResolvedValue({ data: publicAlbum })

      const result = await albumApi.getByShareToken('share-token-123')

      expect(mockedApi.get).toHaveBeenCalledWith('/public/albums/share-token-123')
      expect(result).toEqual(publicAlbum)
    })
  })
})
