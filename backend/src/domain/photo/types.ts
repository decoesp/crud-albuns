export interface PhotoEntity {
  id: string
  title: string
  description: string | null
  filename: string
  originalName: string
  mimeType: string
  size: number
  width: number | null
  height: number | null
  dominantColor: string | null
  acquisitionDate: Date | null
  exifData: Record<string, unknown> | null
  s3Key: string
  albumId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface PhotoWithAlbum extends PhotoEntity {
  album: {
    id: string
    userId: string
    title: string
  }
}

export interface PhotoWithUrl extends PhotoEntity {
  url: string
}

export interface CreatePhotoData {
  title: string
  description?: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  width?: number
  height?: number
  dominantColor?: string
  acquisitionDate?: Date
  exifData?: Record<string, unknown>
  s3Key: string
  albumId: string
}

export interface UpdatePhotoData {
  title?: string
  description?: string
  dominantColor?: string
  acquisitionDate?: Date
  width?: number
  height?: number
  exifData?: Record<string, unknown>
}

export interface ListPhotosParams {
  albumId: string
  page: number
  limit: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export interface PhotoListResult {
  photos: PhotoEntity[]
  total: number
}

export interface ImageMetadata {
  width?: number
  height?: number
  dominantColor?: string
  acquisitionDate?: string
  exifData?: Record<string, unknown>
}
