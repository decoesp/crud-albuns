import { Request, Response } from 'express'
import { authService } from '../services/auth.service.js'
import { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from '../schemas/auth.schema.js'

export const authController = {
  async register(req: Request<unknown, unknown, RegisterInput>, res: Response) {
    const result = await authService.register(req.body)
    return res.status(201).json(result)
  },

  async login(req: Request<unknown, unknown, LoginInput>, res: Response) {
    const result = await authService.login(req.body)
    return res.json(result)
  },

  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body
    const result = await authService.refreshToken(refreshToken)
    return res.json(result)
  },

  async logout(req: Request, res: Response) {
    await authService.logout(req.user!.id)
    return res.status(204).send()
  },

  async forgotPassword(req: Request<unknown, unknown, ForgotPasswordInput>, res: Response) {
    const result = await authService.forgotPassword(req.body)
    return res.json(result)
  },

  async resetPassword(req: Request<unknown, unknown, ResetPasswordInput>, res: Response) {
    const result = await authService.resetPassword(req.body)
    return res.json(result)
  },

  async getProfile(req: Request, res: Response) {
    const result = await authService.getProfile(req.user!.id)
    return res.json(result)
  }
}
