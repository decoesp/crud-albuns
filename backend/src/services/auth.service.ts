import { v4 as uuidv4 } from 'uuid'
import { userRepository } from '../repositories/user.repository.js'
import { passwordResetRepository } from '../repositories/password-reset.repository.js'
import { hashPassword, comparePassword } from '../utils/password.js'
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.js'
import { sendPasswordResetEmail } from '../utils/email.js'
import { logger } from '../utils/logger.js'
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '../utils/errors.js'
import { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from '../schemas/auth.schema.js'

export const authService = {
  async register(data: RegisterInput) {
    const existingUser = await userRepository.findByEmail(data.email)
    if (existingUser) {
      throw new ConflictError('Email já cadastrado')
    }

    const hashedPassword = await hashPassword(data.password)
    const user = await userRepository.create({
      email: data.email,
      name: data.name,
      password: hashedPassword
    })

    const tokens = generateTokenPair(user.id, user.email)
    await userRepository.updateRefreshToken(user.id, tokens.refreshToken)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      ...tokens
    }
  },

  async login(data: LoginInput) {
    const user = await userRepository.findByEmail(data.email)
    if (!user || !user.password) {
      throw new UnauthorizedError('Credenciais inválidas')
    }

    const isValidPassword = await comparePassword(data.password, user.password)
    if (!isValidPassword) {
      throw new UnauthorizedError('Credenciais inválidas')
    }

    const tokens = generateTokenPair(user.id, user.email)
    await userRepository.updateRefreshToken(user.id, tokens.refreshToken)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      ...tokens
    }
  },

  async refreshToken(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken)
      const user = await userRepository.findById(payload.userId)

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedError('Token inválido')
      }

      const tokens = generateTokenPair(user.id, user.email)
      await userRepository.updateRefreshToken(user.id, tokens.refreshToken)

      return tokens
    } catch {
      throw new UnauthorizedError('Token inválido ou expirado')
    }
  },

  async logout(userId: string) {
    await userRepository.updateRefreshToken(userId, null)
  },

  async forgotPassword(data: ForgotPasswordInput) {
    const user = await userRepository.findByEmail(data.email)
    
    if (!user) {
      return { message: 'Se o email existir, você receberá um link de recuperação' }
    }

    const token = uuidv4()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await passwordResetRepository.create(user.id, token, expiresAt)
    await sendPasswordResetEmail(user.email, token, user.name)

    logger.info('Password reset requested', 'Auth', { userId: user.id })

    return { message: 'Se o email existir, você receberá um link de recuperação' }
  },

  async resetPassword(data: ResetPasswordInput) {
    const resetToken = await passwordResetRepository.findByToken(data.token)
    if (!resetToken) {
      throw new BadRequestError('Token inválido ou expirado')
    }

    const user = await userRepository.findById(resetToken.userId)
    if (!user) {
      throw new NotFoundError('Usuário não encontrado')
    }

    const hashedPassword = await hashPassword(data.password)
    await userRepository.update(user.id, { password: hashedPassword })
    await passwordResetRepository.markAsUsed(resetToken.id)
    await userRepository.updateRefreshToken(user.id, null)

    logger.info('Password reset completed', 'Auth', { userId: user.id })

    return { message: 'Senha alterada com sucesso' }
  },

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('Usuário não encontrado')
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      provider: user.provider,
      createdAt: user.createdAt
    }
  }
}
