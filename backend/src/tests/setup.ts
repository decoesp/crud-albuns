import prisma from '../config/database.js'
import { beforeAll, afterAll, beforeEach, vi } from 'vitest'

// Mock color-thief-node to avoid canvas native module issues
vi.mock('color-thief-node', () => ({
  getColorFromURL: vi.fn().mockResolvedValue([128, 128, 128])
}))

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
