import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'

const createAlbumSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200),
  description: z.string().max(2000).optional()
})

type CreateAlbumForm = z.infer<typeof createAlbumSchema>

interface CreateAlbumModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateAlbumForm) => Promise<void>
  isLoading: boolean
}

export default function CreateAlbumModal({ isOpen, onClose, onSubmit, isLoading }: CreateAlbumModalProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateAlbumForm>({
    resolver: zodResolver(createAlbumSchema)
  })

  const handleFormSubmit = async (data: CreateAlbumForm) => {
    await onSubmit(data)
    reset()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Criar novo álbum">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          id="title"
          label="Título"
          placeholder="Nome do álbum"
          error={errors.title?.message}
          {...register('title')}
        />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            id="description"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500"
            rows={3}
            placeholder="Descrição opcional"
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600" role="alert">{errors.description.message}</p>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Criar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
