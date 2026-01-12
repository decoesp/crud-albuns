import { Router } from 'express'
import { albumController } from '../controllers/album.controller.js'

const router = Router()

router.get('/albums/:shareToken', albumController.getByShareToken)

export default router
