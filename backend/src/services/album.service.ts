import { v4 as uuidv4 } from 'uuid'
import { albumRepository } from '../repositories/album.repository.js'
import { generateDownloadUrl } from '../config/s3.js'
import { CreateAlbumInput, UpdateAlbumInput, ListAlbumsQuery } from '../schemas/album.schema.js'
import { PaginatedResponse } from '../types/index.js'
import { AlbumListItem, AlbumWithPhotos } from '../domain/album/types.js'
import {
  ensureAlbumExists,
  ensureAlbumOwnership,
  ensureCanDeleteAlbum,
  toAlbumListItem,
  toAlbumDetail,
  buildShareUpdate,
  toShareResult,
  buildPaginatedResponse
} from '../domain/album/operations.js'

const toAlbumWithPhotosFromRepo = (album: {
  id: string
  title: string
  description: string | null
  userId: string
  shareToken: string | null
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  photos: { s3Key: string }[]
  _count: { photos: number }
}): AlbumWithPhotos => ({
  id: album.id,
  title: album.title,
  description: album.description,
  userId: album.userId,
  shareToken: album.shareToken,
  isPublic: album.isPublic,
  createdAt: album.createdAt,
  updatedAt: album.updatedAt,
  deletedAt: album.deletedAt,
  photos: album.photos.map((p) => ({ id: '', s3Key: p.s3Key })),
  photoCount: album._count.photos
})

const enrichAlbumWithCover = async (
  album: AlbumWithPhotos,
  generateUrl: (key: string) => Promise<string>
): Promise<AlbumListItem> => {
  const coverUrl = album.photos[0]?.s3Key
    ? await generateUrl(album.photos[0].s3Key)
    : null
  return toAlbumListItem(album, coverUrl)
}

export const albumService = {
  async create(userId: string, data: CreateAlbumInput) {
    return albumRepository.create({ ...data, userId })
  },

  async list(userId: string, query: ListAlbumsQuery): Promise<PaginatedResponse<AlbumListItem>> {
    const { albums, total } = await albumRepository.findByUserId({
      userId,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      search: query.search
    })

    const domainAlbums = albums.map(toAlbumWithPhotosFromRepo)
    const albumsWithCover = await Promise.all(
      domainAlbums.map((album) => enrichAlbumWithCover(album, generateDownloadUrl))
    )

    return buildPaginatedResponse(albumsWithCover, total, query.page, query.limit)
  },

  async getById(userId: string, albumId: string) {
    const album = ensureAlbumOwnership(
      ensureAlbumExists(await albumRepository.findByIdWithPhotos(albumId)),
      userId
    )

    return toAlbumDetail(toAlbumWithPhotosFromRepo(album))
  },

  async getByShareToken(shareToken: string) {
    const album = ensureAlbumExists(
      await albumRepository.findByShareToken(shareToken),
      'Álbum não encontrado ou não é público'
    )

    const photosWithUrls = await Promise.all(
      album.photos.map(async (photo) => ({
        ...photo,
        url: await generateDownloadUrl(photo.s3Key)
      }))
    )

    return {
      id: album.id,
      title: album.title,
      description: album.description,
      ownerName: album.user.name,
      photos: photosWithUrls
    }
  },

  async update(userId: string, albumId: string, data: UpdateAlbumInput) {
    ensureAlbumOwnership(
      ensureAlbumExists(await albumRepository.findById(albumId)),
      userId
    )

    return albumRepository.update(albumId, data)
  },

  async delete(userId: string, albumId: string) {
    ensureAlbumOwnership(
      ensureAlbumExists(await albumRepository.findById(albumId)),
      userId
    )

    const hasPhotos = await albumRepository.hasActivePhotos(albumId)
    ensureCanDeleteAlbum(hasPhotos)

    return albumRepository.softDelete(albumId)
  },

  async toggleShare(userId: string, albumId: string, isPublic: boolean) {
    const album = ensureAlbumOwnership(
      ensureAlbumExists(await albumRepository.findById(albumId)),
      userId
    )

    const shareUpdate = buildShareUpdate(isPublic, album.shareToken, uuidv4)
    const updatedAlbum = await albumRepository.update(albumId, shareUpdate)

    return toShareResult(updatedAlbum)
  }
}
