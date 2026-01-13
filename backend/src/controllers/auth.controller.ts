import { Request, Response } from 'express'
import { authService } from '../services/auth.service.js'
import { RegisterInput, LoginInput, RefreshTokenInput, ForgotPasswordInput, ResetPasswordInput } from '../schemas/auth.schema.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const authController = {
  register: asyncHandler(async (req: Request<unknown, unknown, RegisterInput>, res: Response) => {
    const result = await authService.register(req.body)
    return res.status(201).json(result)
  }),

  login: asyncHandler(async (req: Request<unknown, unknown, LoginInput>, res: Response) => {
    const result = await authService.login(req.body)
    return res.json(result)
  }),

  refreshToken: asyncHandler(async (req: Request<unknown, unknown, RefreshTokenInput>, res: Response) => {
    const result = await authService.refreshToken(req.body.refreshToken)
    return res.json(result)
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(req.user!.id)
    return res.status(204).send()
  }),

  forgotPassword: asyncHandler(async (req: Request<unknown, unknown, ForgotPasswordInput>, res: Response) => {
    await authService.forgotPassword(req.body)
    return res.json({ message: 'Se o email existir, você receberá instruções de recuperação' })
  }),

  resetPassword: asyncHandler(async (req: Request<unknown, unknown, ResetPasswordInput>, res: Response) => {
    await authService.resetPassword(req.body)
    return res.json({ message: 'Senha alterada com sucesso' })
  }),

  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.getProfile(req.user!.id)
    return res.json(result)
  })
}
