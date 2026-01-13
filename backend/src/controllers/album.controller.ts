import { Request, Response } from 'express'
import { albumService } from '../services/album.service.js'
import { CreateAlbumInput, UpdateAlbumInput, ListAlbumsQuery } from '../schemas/album.schema.js'
import { asyncHandler } from '../utils/asyncHandler.js'

interface AlbumParams {
  id: string
}

interface ShareTokenParams {
  shareToken: string
}

export const albumController = {
  create: asyncHandler(async (req: Request<unknown, unknown, CreateAlbumInput>, res: Response) => {
    const result = await albumService.create(req.user!.id, req.body)
    return res.status(201).json(result)
  }),

  list: asyncHandler(async (req: Request<unknown, unknown, unknown, ListAlbumsQuery>, res: Response) => {
    const result = await albumService.list(req.user!.id, req.query as ListAlbumsQuery)
    return res.json(result)
  }),

  getById: asyncHandler(async (req: Request<AlbumParams>, res: Response) => {
    const result = await albumService.getById(req.user!.id, req.params.id)
    return res.json(result)
  }),

  getByShareToken: asyncHandler(async (req: Request<ShareTokenParams>, res: Response) => {
    const result = await albumService.getByShareToken(req.params.shareToken)
    return res.json(result)
  }),

  update: asyncHandler(async (req: Request<AlbumParams, unknown, UpdateAlbumInput>, res: Response) => {
    const result = await albumService.update(req.user!.id, req.params.id, req.body)
    return res.json(result)
  }),

  delete: asyncHandler(async (req: Request<AlbumParams>, res: Response) => {
    await albumService.delete(req.user!.id, req.params.id)
    return res.status(204).send()
  }),

  toggleShare: asyncHandler(async (req: Request<AlbumParams>, res: Response) => {
    const { isPublic } = req.body
    const result = await albumService.toggleShare(req.user!.id, req.params.id, isPublic)
    return res.json(result)
  })
}
