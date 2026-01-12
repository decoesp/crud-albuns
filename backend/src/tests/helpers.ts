import prisma from '../config/database.js'
import { hashPassword } from '../utils/password.js'
import { generateTokenPair } from '../utils/jwt.js'

export async function createTestUser(data?: { email?: string; name?: string; password?: string }) {
  const email = data?.email || `test-${Date.now()}@example.com`
  const name = data?.name || 'Test User'
  const password = data?.password || 'Test@123'

  const hashedPassword = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword
    }
  })

  const tokens = generateTokenPair(user.id, user.email)

  return { user, tokens, plainPassword: password }
}

export async function createTestAlbum(userId: string, data?: { title?: string; description?: string }) {
  return prisma.album.create({
    data: {
      title: data?.title || 'Test Album',
      description: data?.description || 'Test Description',
      userId
    }
  })
}

export async function createTestPhoto(albumId: string, data?: { title?: string }) {
  return prisma.photo.create({
    data: {
      title: data?.title || 'Test Photo',
      filename: 'test.jpg',
      originalName: 'test.jpg',
      mimeType: 'image/jpeg',
      size: 1024,
      s3Key: `photos/${albumId}/test-${Date.now()}.jpg`,
      albumId
    }
  })
}
