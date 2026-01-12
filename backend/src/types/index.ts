import { User } from '@prisma/client'

export interface JwtPayload {
  userId: string
  email: string
  type: 'access' | 'refresh'
}

export interface AuthenticatedRequest {
  user: User
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
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
}

export interface PhotoMetadata {
  width?: number
  height?: number
  dominantColor?: string
  acquisitionDate?: Date
  exifData?: Record<string, unknown>
}
