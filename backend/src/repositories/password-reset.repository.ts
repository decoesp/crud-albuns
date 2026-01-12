import prisma from '../config/database.js'
import { PasswordResetToken } from '@prisma/client'

export const passwordResetRepository = {
  async create(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.create({
      data: { userId, token, expiresAt }
    })
  },

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    return prisma.passwordResetToken.findFirst({
      where: {
        token,
        usedAt: null,
        expiresAt: { gt: new Date() }
      }
    })
  },

  async markAsUsed(id: string): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() }
    })
  },

  async deleteExpired(): Promise<number> {
    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { usedAt: { not: null } }
        ]
      }
    })
    return result.count
  }
}
