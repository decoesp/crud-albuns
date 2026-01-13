import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createLocalStorageTokenStorage } from './tokenStorage'

describe('TokenStorage', () => {
  const mockStorage: Record<string, string> = {}

  beforeEach(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key])

    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value }),
      removeItem: vi.fn((key: string) => { delete mockStorage[key] })
    })
  })

  describe('createLocalStorageTokenStorage', () => {
    it('should return null when no tokens exist', () => {
      const storage = createLocalStorageTokenStorage()

      expect(storage.getAccessToken()).toBeNull()
      expect(storage.getRefreshToken()).toBeNull()
    })

    it('should store and retrieve tokens', () => {
      const storage = createLocalStorageTokenStorage()

      storage.setTokens('access-123', 'refresh-456')

      expect(storage.getAccessToken()).toBe('access-123')
      expect(storage.getRefreshToken()).toBe('refresh-456')
    })

    it('should clear tokens', () => {
      const storage = createLocalStorageTokenStorage()
      storage.setTokens('access-123', 'refresh-456')

      storage.clearTokens()

      expect(storage.getAccessToken()).toBeNull()
      expect(storage.getRefreshToken()).toBeNull()
    })

    it('should report hasTokens correctly', () => {
      const storage = createLocalStorageTokenStorage()

      expect(storage.hasTokens()).toBe(false)

      storage.setTokens('access-123', 'refresh-456')

      expect(storage.hasTokens()).toBe(true)

      storage.clearTokens()

      expect(storage.hasTokens()).toBe(false)
    })
  })
})
