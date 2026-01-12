import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../app.js'
import { createTestUser } from './helpers.js'
import prisma from '../config/database.js'

describe('Auth Integration Tests', () => {
  beforeEach(async () => {
    await prisma.photo.deleteMany()
    await prisma.album.deleteMany()
    await prisma.passwordResetToken.deleteMany()
    await prisma.user.deleteMany()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Test@123'
        })

      expect(response.status).toBe(201)
      expect(response.body.user.email).toBe('test@example.com')
      expect(response.body.accessToken).toBeDefined()
      expect(response.body.refreshToken).toBeDefined()
    })

    it('should reject duplicate email', async () => {
      await createTestUser({ email: 'existing@example.com' })

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: 'existing@example.com',
          password: 'Test@123'
        })

      expect(response.status).toBe(409)
    })

    it('should validate password requirements', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: 'test@example.com',
          password: 'weak'
        })

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      await createTestUser({ email: 'login@example.com', password: 'Test@123' })

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Test@123'
        })

      expect(response.status).toBe(200)
      expect(response.body.accessToken).toBeDefined()
    })

    it('should reject invalid credentials', async () => {
      await createTestUser({ email: 'login@example.com' })

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword@123'
        })

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens', async () => {
      const { tokens } = await createTestUser()

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: tokens.refreshToken })

      expect(response.status).toBe(200)
      expect(response.body.accessToken).toBeDefined()
      expect(response.body.refreshToken).toBeDefined()
    })
  })

  describe('GET /api/auth/profile', () => {
    it('should return user profile', async () => {
      const { tokens } = await createTestUser({ name: 'Profile User' })

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${tokens.accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.name).toBe('Profile User')
    })

    it('should reject without token', async () => {
      const response = await request(app).get('/api/auth/profile')

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/auth/forgot-password', () => {
    it('should accept request for existing email', async () => {
      await createTestUser({ email: 'forgot@example.com' })

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'forgot@example.com' })

      expect(response.status).toBe(200)
    })

    it('should return same response for non-existing email (no enumeration)', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })

      expect(response.status).toBe(200)
    })
  })
})
