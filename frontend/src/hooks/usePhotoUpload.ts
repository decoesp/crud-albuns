import { useState, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useGenerateBatchUploadUrls, useCreatePhoto, useProcessPhotoMetadata } from './usePhotos'
import { compressImages, CompressionResult, formatCompressionStats } from '../lib/imageCompression'
import { useImageCompressionWorker, isWorkerSupported } from '../lib/useImageCompressionWorker'

interface PhotoMetadataInput {
  title?: string
  description?: string
  acquisitionDate?: string
  dominantColor?: string
}

interface UsePhotoUploadOptions {
  albumId: string
  onSuccess?: () => void
}

interface UsePhotoUploadReturn {
  uploadingFiles: File[]
  compressedFiles: CompressionResult[]
  isCompressing: boolean
  compressionStats: string
  uploadProgress: Record<string, number>
  photoMetadata: Record<string, PhotoMetadataInput>
  isUploading: boolean
  onDrop: (acceptedFiles: File[]) => Promise<void>
  handleUpload: () => Promise<void>
  removeFile: (index: number) => void
  updateMetadata: (fileKey: string, metadata: Partial<PhotoMetadataInput>) => void
  reset: () => void
}

export function usePhotoUpload({ albumId, onSuccess }: UsePhotoUploadOptions): UsePhotoUploadReturn {
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([])
  const [compressedFiles, setCompressedFiles] = useState<CompressionResult[]>([])
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionStats, setCompressionStats] = useState('')
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [photoMetadata, setPhotoMetadata] = useState<Record<string, PhotoMetadataInput>>({})

  const generateUploadUrls = useGenerateBatchUploadUrls()
  const createPhoto = useCreatePhoto()
  const processMetadata = useProcessPhotoMetadata()

  const isUploading = generateUploadUrls.isPending || createPhoto.isPending

  const workerCompression = isWorkerSupported() ? useImageCompressionWorker() : null

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploadingFiles((prev) => [...prev, ...acceptedFiles])
    setIsCompressing(true)
    
    try {
      const compressionOptions = {
        maxWidth: 2048,
        maxHeight: 2048,
        quality: 0.8,
        outputFormat: 'webp' as const
      }

      const results = workerCompression
        ? await workerCompression.compressImages(acceptedFiles, compressionOptions)
        : await compressImages(acceptedFiles, compressionOptions)

      setCompressedFiles((prev) => [...prev, ...results])
      setCompressionStats(formatCompressionStats(results))
    } catch {
      toast.error('Erro ao comprimir imagens')
    } finally {
      setIsCompressing(false)
    }
  }, [workerCompression])

  const handleUpload = async () => {
    if (compressedFiles.length === 0) return

    const now = new Date()
    for (const result of compressedFiles) {
      const metadata = photoMetadata[result.id]
      if (metadata?.acquisitionDate) {
        const acquisitionDate = new Date(metadata.acquisitionDate)
        if (acquisitionDate > now) {
          toast.error(`A data de aquisição de "${result.file.name}" não pode ser futura`)
          return
        }
      }
    }

    try {
      const filesToUpload = compressedFiles.map((r) => ({
        filename: r.file.name,
        contentType: r.file.type
      }))
      const uploadUrls = await generateUploadUrls.mutateAsync({ albumId, files: filesToUpload })

      for (let i = 0; i < compressedFiles.length; i++) {
        const { file, originalSize } = compressedFiles[i]
        const urlData = uploadUrls[i]

        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }))

        await axios.put(urlData.uploadUrl, file, {
          headers: { 'Content-Type': file.type },
          onUploadProgress: (e) => {
            const progress = Math.round((e.loaded * 100) / (e.total || 1))
            setUploadProgress((prev) => ({ ...prev, [file.name]: progress }))
          }
        })

        const metadata = photoMetadata[compressedFiles[i].id] || {}
        const createdPhoto = await createPhoto.mutateAsync({
          albumId,
          data: {
            title: metadata.title,
            description: metadata.description,
            acquisitionDate: metadata.acquisitionDate,
            dominantColor: metadata.dominantColor,
            filename: file.name,
            originalName: uploadingFiles[i]?.name || file.name,
            mimeType: file.type,
            size: originalSize,
            s3Key: urlData.key
          }
        })

        if (!metadata.dominantColor || !metadata.acquisitionDate) {
          processMetadata.mutate({ albumId, photoId: createdPhoto.id })
        }
      }

      toast.success(`${compressedFiles.length} foto(s) enviada(s) com sucesso!`)
      reset()
      onSuccess?.()
    } catch {
      toast.error('Erro ao enviar fotos')
    }
  }

  const removeFile = (index: number) => {
    const fileToRemove = compressedFiles[index]
    
    setCompressedFiles((f) => f.filter((_, j) => j !== index))
    setUploadingFiles((f) => f.filter((_, j) => j !== index))
    setPhotoMetadata((m) => {
      const newMetadata = { ...m }
      delete newMetadata[fileToRemove.id]
      return newMetadata
    })
  }

  const updateMetadata = (fileKey: string, metadata: Partial<PhotoMetadataInput>) => {
    setPhotoMetadata((m) => ({ ...m, [fileKey]: { ...m[fileKey], ...metadata } }))
  }

  const reset = () => {
    setUploadingFiles([])
    setCompressedFiles([])
    setCompressionStats('')
    setUploadProgress({})
    setPhotoMetadata({})
  }

  return {
    uploadingFiles,
    compressedFiles,
    isCompressing,
    compressionStats,
    uploadProgress,
    photoMetadata,
    isUploading,
    onDrop,
    handleUpload,
    removeFile,
    updateMetadata,
    reset
  }
}
