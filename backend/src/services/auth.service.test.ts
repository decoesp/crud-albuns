import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from './auth.service.js'
import { userRepository } from '../repositories/user.repository.js'
import { passwordResetRepository } from '../repositories/password-reset.repository.js'
import * as passwordUtils from '../utils/password.js'
import * as jwtUtils from '../utils/jwt.js'
import * as emailUtils from '../utils/email.js'
import { ConflictError, UnauthorizedError, BadRequestError } from '../utils/errors.js'

vi.mock('../repositories/user.repository.js')
vi.mock('../repositories/password-reset.repository.js')
vi.mock('../utils/password.js')
vi.mock('../utils/jwt.js')
vi.mock('../utils/email.js')

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' }
      const mockTokens = { accessToken: 'access', refreshToken: 'refresh' }

      vi.mocked(userRepository.findByEmail).mockResolvedValue(null)
      vi.mocked(passwordUtils.hashPassword).mockResolvedValue('hashedPassword')
      vi.mocked(userRepository.create).mockResolvedValue(mockUser as never)
      vi.mocked(jwtUtils.generateTokenPair).mockReturnValue(mockTokens)
      vi.mocked(userRepository.updateRefreshToken).mockResolvedValue(mockUser as never)

      const result = await authService.register({
        email: 'test@example.com',
        name: 'Test User',
        password: 'Test@123'
      })

      expect(result.user.email).toBe('test@example.com')
      expect(result.accessToken).toBe('access')
      expect(result.refreshToken).toBe('refresh')
    })

    it('should throw ConflictError if email already exists', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue({ id: '1' } as never)

      await expect(
        authService.register({
          email: 'existing@example.com',
          name: 'Test',
          password: 'Test@123'
        })
      ).rejects.toThrow(ConflictError)
    })
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test', password: 'hashed' }
      const mockTokens = { accessToken: 'access', refreshToken: 'refresh' }

      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser as never)
      vi.mocked(passwordUtils.comparePassword).mockResolvedValue(true)
      vi.mocked(jwtUtils.generateTokenPair).mockReturnValue(mockTokens)
      vi.mocked(userRepository.updateRefreshToken).mockResolvedValue(mockUser as never)

      const result = await authService.login({
        email: 'test@example.com',
        password: 'Test@123'
      })

      expect(result.user.email).toBe('test@example.com')
      expect(result.accessToken).toBe('access')
    })

    it('should throw UnauthorizedError for invalid credentials', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null)

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow(UnauthorizedError)
    })

    it('should throw UnauthorizedError for wrong password', async () => {
      const mockUser = { id: '1', email: 'test@example.com', password: 'hashed' }
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser as never)
      vi.mocked(passwordUtils.comparePassword).mockResolvedValue(false)

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow(UnauthorizedError)
    })
  })

  describe('forgotPassword', () => {
    it('should send reset email for existing user', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test' }
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser as never)
      vi.mocked(passwordResetRepository.create).mockResolvedValue({} as never)
      vi.mocked(emailUtils.sendPasswordResetEmail).mockResolvedValue(undefined)

      const result = await authService.forgotPassword({ email: 'test@example.com' })

      expect(result.message).toContain('Se o email existir')
      expect(passwordResetRepository.create).toHaveBeenCalled()
    })

    it('should return same message for non-existing user (no enumeration)', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null)

      const result = await authService.forgotPassword({ email: 'nonexistent@example.com' })

      expect(result.message).toContain('Se o email existir')
      expect(passwordResetRepository.create).not.toHaveBeenCalled()
    })
  })

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const mockToken = { id: '1', userId: 'user1', token: 'valid' }
      const mockUser = { id: 'user1', email: 'test@example.com' }

      vi.mocked(passwordResetRepository.findByToken).mockResolvedValue(mockToken as never)
      vi.mocked(userRepository.findById).mockResolvedValue(mockUser as never)
      vi.mocked(passwordUtils.hashPassword).mockResolvedValue('newHashed')
      vi.mocked(userRepository.update).mockResolvedValue(mockUser as never)
      vi.mocked(passwordResetRepository.markAsUsed).mockResolvedValue(mockToken as never)
      vi.mocked(userRepository.updateRefreshToken).mockResolvedValue(mockUser as never)

      const result = await authService.resetPassword({
        token: 'valid',
        password: 'NewPass@123'
      })

      expect(result.message).toContain('Senha alterada')
    })

    it('should throw BadRequestError for invalid token', async () => {
      vi.mocked(passwordResetRepository.findByToken).mockResolvedValue(null)

      await expect(
        authService.resetPassword({ token: 'invalid', password: 'NewPass@123' })
      ).rejects.toThrow(BadRequestError)
    })
  })
})
