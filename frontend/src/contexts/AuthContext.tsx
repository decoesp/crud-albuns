import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import api from '../lib/api'
import { User, AuthResponse } from '../types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setTokens: (accessToken: string, refreshToken: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get<User>('/auth/profile')
      setUser(response.data)
    } catch {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      fetchProfile().finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [fetchProfile])

  const setTokens = useCallback((accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password })
    setTokens(response.data.accessToken, response.data.refreshToken)
    setUser(response.data.user)
  }, [setTokens])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/register', { name, email, password })
    setTokens(response.data.accessToken, response.data.refreshToken)
    setUser(response.data.user)
  }, [setTokens])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        setTokens
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
