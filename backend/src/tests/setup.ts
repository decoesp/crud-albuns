import prisma from '../config/database.js'
import { beforeAll, afterAll, beforeEach } from 'vitest'

beforeAll(async () => {
  await prisma.$connect()
})

afterAll(async () => {
  await prisma.$disconnect()
})

beforeEach(async () => {
  await prisma.photo.deleteMany()
  await prisma.album.deleteMany()
  await prisma.passwordResetToken.deleteMany()
  await prisma.user.deleteMany()
})
