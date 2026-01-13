export interface UserEntity {
  id: string
  email: string
  name: string
  password: string | null
  provider: string | null
  providerId: string | null
  refreshToken: string | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface UserPublicInfo {
  id: string
  email: string
  name: string
}

export interface CreateUserData {
  email: string
  name: string
  password?: string
  provider?: string
  providerId?: string
}

export interface UpdateUserData {
  name?: string
  password?: string
  refreshToken?: string | null
}
