import { useRef, useCallback, useEffect } from 'react'
import type { CompressionResult, CompressionOptions } from './imageCompression'

interface WorkerResponse {
  type: 'success' | 'error'
  id: string
  result?: {
    compressedData: ArrayBuffer
    originalSize: number
    compressedSize: number
    compressionRatio: number
    width: number
    height: number
    mimeType: string
    fileName: string
  }
  error?: string
}

type PendingRequest = {
  resolve: (result: CompressionResult) => void
  reject: (error: Error) => void
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.8,
  outputFormat: 'webp'
}

export function useImageCompressionWorker() {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef<Map<string, PendingRequest>>(new Map())

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/imageCompression.worker.ts', import.meta.url),
      { type: 'module' }
    )

    workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { type, id, result, error } = event.data
      const pending = pendingRef.current.get(id)

      if (!pending) return

      pendingRef.current.delete(id)

      if (type === 'success' && result) {
        const file = new File(
          [result.compressedData],
          result.fileName,
          { type: result.mimeType }
        )

        pending.resolve({
          id,
          file,
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          compressionRatio: result.compressionRatio,
          width: result.width,
          height: result.height
        })
      } else {
        pending.reject(new Error(error || 'Compression failed'))
      }
    }

    workerRef.current.onerror = (error) => {
      console.error('Worker error:', error)
      pendingRef.current.forEach((pending) => {
        pending.reject(new Error('Worker error'))
      })
      pendingRef.current.clear()
    }

    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  const compressImage = useCallback(
    async (file: File, options: CompressionOptions = {}): Promise<CompressionResult> => {
      if (!workerRef.current) {
        throw new Error('Worker not initialized')
      }

      const opts = { ...DEFAULT_OPTIONS, ...options }
      const id = crypto.randomUUID()
      const arrayBuffer = await file.arrayBuffer()

      return new Promise((resolve, reject) => {
        pendingRef.current.set(id, { resolve, reject })

        workerRef.current!.postMessage(
          {
            type: 'compress',
            id,
            imageData: arrayBuffer,
            fileName: file.name,
            mimeType: file.type,
            options: opts
          },
          [arrayBuffer]
        )
      })
    },
    []
  )

  const compressImages = useCallback(
    async (
      files: File[],
      options: CompressionOptions = {},
      onProgress?: (completed: number, total: number) => void
    ): Promise<CompressionResult[]> => {
      const results: CompressionResult[] = []
      const imageFiles = files.filter((f) => f.type.startsWith('image/'))

      for (let i = 0; i < imageFiles.length; i++) {
        try {
          const result = await compressImage(imageFiles[i], options)
          results.push(result)
        } catch (error) {
          console.error(`Failed to compress ${imageFiles[i].name}:`, error)
          results.push({
            id: crypto.randomUUID(),
            file: imageFiles[i],
            originalSize: imageFiles[i].size,
            compressedSize: imageFiles[i].size,
            compressionRatio: 0,
            width: 0,
            height: 0
          })
        }

        onProgress?.(i + 1, imageFiles.length)
      }

      return results
    },
    [compressImage]
  )

  return { compressImage, compressImages }
}

export function isWorkerSupported(): boolean {
  return typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined'
}
