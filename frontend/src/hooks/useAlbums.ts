import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { Album, PaginatedResponse } from '../types'
import toast from 'react-hot-toast'

interface ListAlbumsParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

export function useAlbums(params: ListAlbumsParams = {}) {
  return useQuery({
    queryKey: ['albums', params],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Album>>('/albums', { params })
      return response.data
    }
  })
}

export function useAlbum(id: string) {
  return useQuery({
    queryKey: ['album', id],
    queryFn: async () => {
      const response = await api.get<Album>(`/albums/${id}`)
      return response.data
    },
    enabled: !!id
  })
}

export function useCreateAlbum() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      const response = await api.post<Album>('/albums', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] })
      toast.success('Álbum criado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar álbum')
    }
  })
}

export function useUpdateAlbum() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { title?: string; description?: string } }) => {
      const response = await api.patch<Album>(`/albums/${id}`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['albums'] })
      queryClient.invalidateQueries({ queryKey: ['album', variables.id] })
      toast.success('Álbum atualizado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar álbum')
    }
  })
}

export function useDeleteAlbum() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/albums/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] })
      toast.success('Álbum excluído com sucesso!')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || 'Erro ao excluir álbum'
      toast.error(message)
    }
  })
}

export function useToggleShareAlbum() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, isPublic }: { id: string; isPublic: boolean }) => {
      const response = await api.post<{ isPublic: boolean; shareToken: string | null }>(
        `/albums/${id}/share`,
        { isPublic }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['albums'] })
      queryClient.invalidateQueries({ queryKey: ['album', variables.id] })
      toast.success(variables.isPublic ? 'Álbum compartilhado!' : 'Compartilhamento desativado')
    },
    onError: () => {
      toast.error('Erro ao alterar compartilhamento')
    }
  })
}

export function usePublicAlbum(shareToken: string) {
  return useQuery({
    queryKey: ['public-album', shareToken],
    queryFn: async () => {
      const response = await api.get(`/public/albums/${shareToken}`)
      return response.data
    },
    enabled: !!shareToken
  })
}
