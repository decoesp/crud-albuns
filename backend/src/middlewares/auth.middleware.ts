import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt.js'
import { userRepository } from '../repositories/user.repository.js'
import { UnauthorizedError } from '../utils/errors.js'
import { User } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token não fornecido')
  }

  const token = authHeader.substring(7)

  try {
    const payload = verifyAccessToken(token)
    const user = await userRepository.findById(payload.userId)

    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado')
    }

    req.user = user
    next()
  } catch {
    throw new UnauthorizedError('Token inválido ou expirado')
  }
}

export function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.substring(7)

  try {
    const payload = verifyAccessToken(token)
    userRepository.findById(payload.userId).then((user) => {
      if (user) {
        req.user = user
      }
      next()
    })
  } catch {
    next()
  }
}
