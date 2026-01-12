import { Request, Response } from 'express'
import { photoService } from '../services/photo.service.js'
import { CreatePhotoInput, UpdatePhotoInput, ListPhotosQuery, UploadUrlInput, BatchUploadUrlInput } from '../schemas/photo.schema.js'

interface AlbumParams {
  albumId: string
}

interface PhotoParams extends AlbumParams {
  id: string
}

export const photoController = {
  async generateUploadUrl(req: Request<AlbumParams, unknown, UploadUrlInput>, res: Response) {
    const result = await photoService.generateUploadUrl(req.user!.id, req.params.albumId, req.body)
    return res.json(result)
  },

  async generateBatchUploadUrls(req: Request<AlbumParams, unknown, BatchUploadUrlInput>, res: Response) {
    const result = await photoService.generateBatchUploadUrls(req.user!.id, req.params.albumId, req.body)
    return res.json(result)
  },

  async create(req: Request<AlbumParams, unknown, CreatePhotoInput>, res: Response) {
    const result = await photoService.create(req.user!.id, req.params.albumId, req.body)
    return res.status(201).json(result)
  },

  async list(req: Request<AlbumParams, unknown, unknown, ListPhotosQuery>, res: Response) {
    const result = await photoService.list(req.user!.id, req.params.albumId, req.query as ListPhotosQuery)
    return res.json(result)
  },

  async getById(req: Request<PhotoParams>, res: Response) {
    const result = await photoService.getById(req.user!.id, req.params.albumId, req.params.id)
    return res.json(result)
  },

  async update(req: Request<PhotoParams, unknown, UpdatePhotoInput>, res: Response) {
    const result = await photoService.update(req.user!.id, req.params.albumId, req.params.id, req.body)
    return res.json(result)
  },

  async delete(req: Request<PhotoParams>, res: Response) {
    await photoService.delete(req.user!.id, req.params.albumId, req.params.id)
    return res.status(204).send()
  },

  async processMetadata(req: Request<PhotoParams>, res: Response) {
    const result = await photoService.processMetadata(req.user!.id, req.params.albumId, req.params.id)
    return res.json(result)
  }
}
