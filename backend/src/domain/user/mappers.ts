import { User } from '@prisma/client'
import { UserEntity, UserPublicInfo } from './types.js'

export const toUserEntity = (prismaUser: User): UserEntity => ({
  id: prismaUser.id,
  email: prismaUser.email,
  name: prismaUser.name,
  password: prismaUser.password,
  provider: prismaUser.provider,
  providerId: prismaUser.providerId,
  refreshToken: prismaUser.refreshToken,
  createdAt: prismaUser.createdAt,
  updatedAt: prismaUser.updatedAt,
  deletedAt: prismaUser.deletedAt
})

export const toUserPublicInfo = (user: UserEntity): UserPublicInfo => ({
  id: user.id,
  email: user.email,
  name: user.name
})

export const toUserEntityOrNull = (prismaUser: User | null): UserEntity | null =>
  prismaUser ? toUserEntity(prismaUser) : null
