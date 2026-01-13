import rateLimit from 'express-rate-limit'
import { Request } from 'express'

const getUserIdFromRequest = (req: Request): string => {
  const user = req.user as { id?: string } | undefined
  return user?.id || req.ip || 'anonymous'
}

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Muitas requisições deste IP, tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { message: 'Muitas tentativas de autenticação, tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
})

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: { message: 'Muitos uploads, tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getUserIdFromRequest
})

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { message: 'Limite de requisições excedido, aguarde um momento.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getUserIdFromRequest
})

export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: 'Limite de operações sensíveis excedido.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getUserIdFromRequest
})
