import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { JwtPayload } from '../types/index.js'

export function generateAccessToken(userId: string, email: string): string {
  const payload: JwtPayload = {
    userId,
    email,
    type: 'access'
  }

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  })
}

export function generateRefreshToken(userId: string, email: string): string {
  const payload: JwtPayload = {
    userId,
    email,
    type: 'refresh'
  }

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as string
  })
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload
}

export function generateTokenPair(userId: string, email: string) {
  return {
    accessToken: generateAccessToken(userId, email),
    refreshToken: generateRefreshToken(userId, email)
  }
}
