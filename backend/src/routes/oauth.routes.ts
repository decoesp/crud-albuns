import { Router, Request, Response } from 'express'
import passport from '../config/passport.js'
import { generateTokenPair } from '../utils/jwt.js'
import { userRepository } from '../repositories/user.repository.js'
import { env } from '../config/env.js'
import { User } from '@prisma/client'

const router = Router()

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${env.FRONTEND_URL}/login?error=oauth` }),
  async (req: Request, res: Response) => {
    const user = req.user as User
    const tokens = generateTokenPair(user.id, user.email)
    await userRepository.updateRefreshToken(user.id, tokens.refreshToken)

    const redirectUrl = new URL(`${env.FRONTEND_URL}/oauth/callback`)
    redirectUrl.searchParams.set('accessToken', tokens.accessToken)
    redirectUrl.searchParams.set('refreshToken', tokens.refreshToken)

    res.redirect(redirectUrl.toString())
  }
)

router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }))

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${env.FRONTEND_URL}/login?error=oauth` }),
  async (req: Request, res: Response) => {
    const user = req.user as User
    const tokens = generateTokenPair(user.id, user.email)
    await userRepository.updateRefreshToken(user.id, tokens.refreshToken)

    const redirectUrl = new URL(`${env.FRONTEND_URL}/oauth/callback`)
    redirectUrl.searchParams.set('accessToken', tokens.accessToken)
    redirectUrl.searchParams.set('refreshToken', tokens.refreshToken)

    res.redirect(redirectUrl.toString())
  }
)

export default router
