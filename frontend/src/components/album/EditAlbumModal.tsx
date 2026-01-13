import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface EditAlbumModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  isLoading: boolean
  title: string
  description: string
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
}

export default function EditAlbumModal({
  isOpen,
  onClose,
  onSave,
  isLoading,
  title,
  description,
  onTitleChange,
  onDescriptionChange
}: EditAlbumModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar álbum">
      <div className="space-y-4">
        <Input
          label="Título"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
        <div>
          <label className="label">Descrição</label>
          <textarea
            className="input min-h-[100px]"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSave} isLoading={isLoading}>
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
