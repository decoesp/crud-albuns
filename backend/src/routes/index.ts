import { Router } from 'express'
import authRoutes from './auth.routes.js'
import albumRoutes from './album.routes.js'
import photoRoutes from './photo.routes.js'
import publicRoutes from './public.routes.js'
import oauthRoutes from './oauth.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/auth', oauthRoutes)
router.use('/albums', albumRoutes)
router.use('/albums/:albumId/photos', photoRoutes)
router.use('/public', publicRoutes)

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default router
