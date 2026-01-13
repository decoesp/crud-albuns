import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../app.js'
import { createTestUser } from './helpers.js'
import prisma from '../config/database.js'

describe('Photo Integration Tests', () => {
  let authToken: string
  let albumId: string

  beforeEach(async () => {
    await prisma.photo.deleteMany()
    await prisma.album.deleteMany()
    await prisma.passwordResetToken.deleteMany()
    await prisma.user.deleteMany()

    const { tokens, user } = await createTestUser()
    authToken = tokens.accessToken

    const album = await prisma.album.create({
      data: {
        title: 'Test Album',
        userId: user.id
      }
    })
    albumId = album.id
  })

  describe('POST /api/albums/:albumId/photos', () => {
    it('should create a photo with valid acquisition date', async () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString()

      const response = await request(app)
        .post(`/api/albums/${albumId}/photos`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Photo',
          s3Key: 'test-key-123',
          filename: 'test.jpg',
          originalName: 'test.jpg',
          mimeType: 'image/jpeg',
          size: 1024,
          acquisitionDate: pastDate
        })

      expect(response.status).toBe(201)
      expect(response.body.title).toBe('Test Photo')
      expect(new Date(response.body.acquisitionDate).getTime()).toBeLessThanOrEqual(Date.now())
    })

    it('should reject photo with future acquisition date', async () => {
      const futureDate = new Date(Date.now() + 86400000 * 7).toISOString()

      const response = await request(app)
        .post(`/api/albums/${albumId}/photos`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Future Photo',
          s3Key: 'test-key-456',
          filename: 'future.jpg',
          originalName: 'future.jpg',
          mimeType: 'image/jpeg',
          size: 1024,
          acquisitionDate: futureDate
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('futura')
    })

    it('should use current date when acquisition date is not provided', async () => {
      const beforeRequest = Date.now()

      const response = await request(app)
        .post(`/api/albums/${albumId}/photos`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'No Date Photo',
          s3Key: 'test-key-789',
          filename: 'nodate.jpg',
          originalName: 'nodate.jpg',
          mimeType: 'image/jpeg',
          size: 1024
        })

      expect(response.status).toBe(201)
      const acquisitionTime = new Date(response.body.acquisitionDate).getTime()
      expect(acquisitionTime).toBeGreaterThanOrEqual(beforeRequest)
      expect(acquisitionTime).toBeLessThanOrEqual(Date.now())
    })
  })

  describe('PATCH /api/albums/:albumId/photos/:photoId', () => {
    let photoId: string

    beforeEach(async () => {
      const photo = await prisma.photo.create({
        data: {
          title: 'Original Photo',
          s3Key: 'original-key',
          filename: 'original.jpg',
          originalName: 'original.jpg',
          mimeType: 'image/jpeg',
          size: 1024,
          albumId,
          acquisitionDate: new Date()
        }
      })
      photoId = photo.id
    })

    it('should update photo with valid acquisition date', async () => {
      const pastDate = new Date(Date.now() - 86400000 * 30).toISOString()

      const response = await request(app)
        .patch(`/api/albums/${albumId}/photos/${photoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Photo',
          acquisitionDate: pastDate
        })

      expect(response.status).toBe(200)
      expect(response.body.title).toBe('Updated Photo')
    })

    it('should reject update with future acquisition date', async () => {
      const futureDate = new Date(Date.now() + 86400000 * 30).toISOString()

      const response = await request(app)
        .patch(`/api/albums/${albumId}/photos/${photoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          acquisitionDate: futureDate
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('futura')
    })
  })

  describe('Authorization', () => {
    it('should reject requests without authentication', async () => {
      const response = await request(app)
        .get(`/api/albums/${albumId}/photos`)

      expect(response.status).toBe(401)
    })

    it('should reject access to another user album', async () => {
      const { tokens: otherTokens } = await createTestUser({ email: 'other@example.com' })

      const response = await request(app)
        .get(`/api/albums/${albumId}/photos`)
        .set('Authorization', `Bearer ${otherTokens.accessToken}`)

      expect(response.status).toBe(403)
    })
  })
})
