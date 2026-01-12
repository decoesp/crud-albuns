export interface User {
  id: string
  email: string
  name: string
  provider?: string
  createdAt: string
}

export interface Album {
  id: string
  title: string
  description?: string
  photoCount: number
  coverUrl?: string
  isPublic: boolean
  shareToken?: string
  createdAt: string
  updatedAt: string
}

export interface Photo {
  id: string
  title: string
  description?: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  width?: number
  height?: number
  dominantColor?: string
  acquisitionDate?: string
  url: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface UploadUrlResponse {
  uploadUrl: string
  key: string
  expiresIn: number
  originalFilename?: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}
