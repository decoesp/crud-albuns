import prisma from '../config/database.js'
import { User } from '@prisma/client'

export interface CreateUserData {
  email: string
  name: string
  password?: string
  provider?: string
  providerId?: string
}

export interface UpdateUserData {
  name?: string
  password?: string
  refreshToken?: string | null
  provider?: string
  providerId?: string
}

export const userRepository = {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { id, deletedAt: null }
    })
  },

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { email, deletedAt: null }
    })
  },

  async findByProvider(provider: string, providerId: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { provider, providerId, deletedAt: null }
    })
  },

  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({ data })
  },

  async update(id: string, data: UpdateUserData): Promise<User> {
    return prisma.user.update({
      where: { id },
      data
    })
  },

  async softDelete(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    })
  },

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { refreshToken }
    })
  }
}
