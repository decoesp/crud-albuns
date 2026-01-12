import { Router } from 'express'
import { photoController } from '../controllers/photo.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validate.middleware.js'
import {
  createPhotoSchema,
  updatePhotoSchema,
  photoIdParamSchema,
  listPhotosSchema,
  uploadUrlSchema,
  batchUploadUrlSchema,
  processMetadataSchema
} from '../schemas/photo.schema.js'

const router = Router({ mergeParams: true })

router.use(authMiddleware)

router.get('/', validate(listPhotosSchema), photoController.list)
router.post('/', validate(createPhotoSchema), photoController.create)
router.post('/upload-url', validate(uploadUrlSchema), photoController.generateUploadUrl)
router.post('/batch-upload-url', validate(batchUploadUrlSchema), photoController.generateBatchUploadUrls)
router.get('/:id', validate(photoIdParamSchema), photoController.getById)
router.post('/:id/process-metadata', validate(processMetadataSchema), photoController.processMetadata)
router.patch('/:id', validate(updatePhotoSchema), photoController.update)
router.delete('/:id', validate(photoIdParamSchema), photoController.delete)

export default router
