import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { albumApi } from '../api/albumApi'
import { albumKeys } from './useAlbumQueries'
import { AxiosError } from 'axios'

export function useCreateAlbum() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { title: string; description?: string }) => albumApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all })
      toast.success('Álbum criado com sucesso!')
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data?.message || 'Erro ao criar álbum'
      toast.error(message)
    }
  })
}

export function useUpdateAlbum() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; description?: string } }) =>
      albumApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all })
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(variables.id) })
      toast.success('Álbum atualizado com sucesso!')
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data?.message || 'Erro ao atualizar álbum'
      toast.error(message)
    }
  })
}

export function useDeleteAlbum() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => albumApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all })
      toast.success('Álbum excluído com sucesso!')
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data?.message || 'Erro ao excluir álbum'
      toast.error(message)
    }
  })
}

export function useToggleShareAlbum() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isPublic }: { id: string; isPublic: boolean }) =>
      albumApi.toggleShare(id, isPublic),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all })
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(variables.id) })
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data?.message || 'Erro ao compartilhar álbum'
      toast.error(message)
    }
  })
}
