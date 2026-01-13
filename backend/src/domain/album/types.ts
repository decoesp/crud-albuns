export interface AlbumEntity {
  id: string
  title: string
  description: string | null
  userId: string
  shareToken: string | null
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface AlbumWithPhotos extends AlbumEntity {
  photos: PhotoSummary[]
  photoCount: number
}

export interface PhotoSummary {
  id: string
  s3Key: string
}

export interface AlbumListItem {
  id: string
  title: string
  description: string | null
  photoCount: number
  coverUrl: string | null
  isPublic: boolean
  shareToken: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateAlbumData {
  title: string
  description?: string
  userId: string
}

export interface UpdateAlbumData {
  title?: string
  description?: string
  shareToken?: string | null
  isPublic?: boolean
}

export interface ListAlbumsParams {
  userId: string
  page: number
  limit: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  search?: string
}

export interface AlbumListResult {
  albums: AlbumWithPhotos[]
  total: number
}
