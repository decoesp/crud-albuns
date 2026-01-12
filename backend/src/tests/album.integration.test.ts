import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../app.js'
import { createTestUser, createTestAlbum, createTestPhoto } from './helpers.js'
import prisma from '../config/database.js'

describe('Album Integration Tests', () => {
  beforeEach(async () => {
    await prisma.photo.deleteMany()
    await prisma.album.deleteMany()
    await prisma.passwordResetToken.deleteMany()
    await prisma.user.deleteMany()
  })

  describe('POST /api/albums', () => {
    it('should create an album', async () => {
      const { tokens } = await createTestUser()

      const response = await request(app)
        .post('/api/albums')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({
          title: 'My Album',
          description: 'Test description'
        })

      expect(response.status).toBe(201)
      expect(response.body.title).toBe('My Album')
    })

    it('should reject without authentication', async () => {
      const response = await request(app)
        .post('/api/albums')
        .send({ title: 'Test' })

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/albums', () => {
    it('should list user albums with pagination', async () => {
      const { user, tokens } = await createTestUser()
      await createTestAlbum(user.id, { title: 'Album 1' })
      await createTestAlbum(user.id, { title: 'Album 2' })

      const response = await request(app)
        .get('/api/albums')
        .set('Authorization', `Bearer ${tokens.accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(2)
      expect(response.body.meta.total).toBe(2)
    })

    it('should not list other users albums', async () => {
      const { tokens } = await createTestUser({ email: 'user1@example.com' })
      const { user: otherUser } = await createTestUser({ email: 'user2@example.com' })
      await createTestAlbum(otherUser.id)

      const response = await request(app)
        .get('/api/albums')
        .set('Authorization', `Bearer ${tokens.accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(0)
    })
  })

  describe('GET /api/albums/:id', () => {
    it('should return album details', async () => {
      const { user, tokens } = await createTestUser()
      const album = await createTestAlbum(user.id, { title: 'Detail Album' })

      const response = await request(app)
        .get(`/api/albums/${album.id}`)
        .set('Authorization', `Bearer ${tokens.accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.title).toBe('Detail Album')
    })

    it('should return 403 for other users album', async () => {
      const { tokens } = await createTestUser({ email: 'user1@example.com' })
      const { user: otherUser } = await createTestUser({ email: 'user2@example.com' })
      const album = await createTestAlbum(otherUser.id)

      const response = await request(app)
        .get(`/api/albums/${album.id}`)
        .set('Authorization', `Bearer ${tokens.accessToken}`)

      expect(response.status).toBe(403)
    })
  })

  describe('PATCH /api/albums/:id', () => {
    it('should update album', async () => {
      const { user, tokens } = await createTestUser()
      const album = await createTestAlbum(user.id)

      const response = await request(app)
        .patch(`/api/albums/${album.id}`)
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({ title: 'Updated Title' })

      expect(response.status).toBe(200)
      expect(response.body.title).toBe('Updated Title')
    })
  })

  describe('DELETE /api/albums/:id', () => {
    it('should delete album without photos', async () => {
      const { user, tokens } = await createTestUser()
      const album = await createTestAlbum(user.id)

      const response = await request(app)
        .delete(`/api/albums/${album.id}`)
        .set('Authorization', `Bearer ${tokens.accessToken}`)

      expect(response.status).toBe(204)
    })

    it('should reject deletion of album with photos', async () => {
      const { user, tokens } = await createTestUser()
      const album = await createTestAlbum(user.id)
      await createTestPhoto(album.id)

      const response = await request(app)
        .delete(`/api/albums/${album.id}`)
        .set('Authorization', `Bearer ${tokens.accessToken}`)

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/albums/:id/share', () => {
    it('should enable sharing', async () => {
      const { user, tokens } = await createTestUser()
      const album = await createTestAlbum(user.id)

      const response = await request(app)
        .post(`/api/albums/${album.id}/share`)
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({ isPublic: true })

      expect(response.status).toBe(200)
      expect(response.body.isPublic).toBe(true)
      expect(response.body.shareToken).toBeDefined()
    })
  })
})
