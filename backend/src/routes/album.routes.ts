import { Router } from 'express'
import { albumController } from '../controllers/album.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validate.middleware.js'
import {
  createAlbumSchema,
  updateAlbumSchema,
  albumIdParamSchema,
  shareAlbumSchema,
  listAlbumsSchema
} from '../schemas/album.schema.js'

const router = Router()

router.use(authMiddleware)

router.get('/', validate(listAlbumsSchema), albumController.list)
router.post('/', validate(createAlbumSchema), albumController.create)
router.get('/:id', validate(albumIdParamSchema), albumController.getById)
router.patch('/:id', validate(updateAlbumSchema), albumController.update)
router.delete('/:id', validate(albumIdParamSchema), albumController.delete)
router.post('/:id/share', validate(shareAlbumSchema), albumController.toggleShare)

export default router
