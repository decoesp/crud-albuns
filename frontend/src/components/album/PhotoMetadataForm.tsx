import { useMemo } from 'react'
import Input from '../ui/Input'

interface PhotoMetadata {
  title?: string
  description?: string
  acquisitionDate?: string
  dominantColor?: string
}

interface PhotoMetadataFormProps {
  fileId: string
  fileName: string
  metadata: PhotoMetadata
  onUpdateMetadata: (fileId: string, metadata: Partial<PhotoMetadata>) => void
}

export default function PhotoMetadataForm({
  fileId,
  fileName,
  metadata,
  onUpdateMetadata
}: PhotoMetadataFormProps) {
  const maxDateTime = useMemo(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }, [])

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          key={`title-${fileId}`}
          id={`title-${fileId}`}
          label="Título"
          placeholder="Deixe vazio para gerar automaticamente"
          defaultValue={metadata.title ?? ''}
          onBlur={(e) => onUpdateMetadata(fileId, { title: e.target.value })}
        />
        <Input
          key={`date-${fileId}`}
          id={`date-${fileId}`}
          label="Data/Hora de aquisição"
          type="datetime-local"
          max={maxDateTime}
          placeholder="Deixe vazio para usar data atual ou EXIF"
          defaultValue={metadata.acquisitionDate ?? ''}
          onChange={(e) => onUpdateMetadata(fileId, { acquisitionDate: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`desc-${fileId}`} className="label">Descrição</label>
          <textarea
            key={`desc-${fileId}`}
            id={`desc-${fileId}`}
            className="input min-h-[60px]"
            placeholder="Opcional"
            defaultValue={metadata.description ?? ''}
            onBlur={(e) => onUpdateMetadata(fileId, { description: e.target.value })}
          />
        </div>
        <Input
          key={`color-${fileId}`}
          id={`color-${fileId}`}
          label="Cor predominante"
          type="color"
          placeholder="Deixe vazio para extrair automaticamente"
          defaultValue={metadata.dominantColor ?? '#000000'}
          onChange={(e) => onUpdateMetadata(fileId, { dominantColor: e.target.value })}
        />
      </div>
    </div>
  )
}
