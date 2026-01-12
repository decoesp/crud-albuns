import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/errors.js'
import { env } from '../config/env.js'

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message
    })
  }

  console.error('[ERROR]', error)

  if (env.NODE_ENV === 'development') {
    return res.status(500).json({
      status: 'error',
      message: error.message,
      stack: error.stack
    })
  }

  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor'
  })
}

export function notFoundHandler(_req: Request, res: Response) {
  return res.status(404).json({
    status: 'error',
    message: 'Recurso não encontrado'
  })
}
