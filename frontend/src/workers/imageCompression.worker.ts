/// <reference lib="webworker" />

export interface CompressionOptions {
  maxWidth: number
  maxHeight: number
  quality: number
  outputFormat: 'webp' | 'jpeg' | 'png'
}

export interface WorkerMessage {
  type: 'compress'
  id: string
  imageData: ArrayBuffer
  fileName: string
  mimeType: string
  options: CompressionOptions
}

export interface WorkerResponse {
  type: 'success' | 'error' | 'progress'
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
  progress?: number
}

const getMimeType = (format: string): string => {
  const mimeTypes: Record<string, string> = {
    webp: 'image/webp',
    jpeg: 'image/jpeg',
    png: 'image/png'
  }
  return mimeTypes[format] || 'image/jpeg'
}

const getExtension = (format: string): string => {
  return format === 'jpeg' ? 'jpg' : format
}

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, id, imageData, fileName, options } = event.data

  if (type !== 'compress') return

  try {
    const blob = new Blob([imageData])
    const imageBitmap = await createImageBitmap(blob)

    let { width, height } = imageBitmap

    if (width > options.maxWidth || height > options.maxHeight) {
      const ratio = Math.min(options.maxWidth / width, options.maxHeight / height)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)
    }

    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('OffscreenCanvas context not available')
    }

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(imageBitmap, 0, 0, width, height)

    const mimeType = getMimeType(options.outputFormat)
    const compressedBlob = await canvas.convertToBlob({
      type: mimeType,
      quality: options.quality
    })

    const compressedData = await compressedBlob.arrayBuffer()
    const originalName = fileName.replace(/\.[^/.]+$/, '')
    const extension = getExtension(options.outputFormat)

    const response: WorkerResponse = {
      type: 'success',
      id,
      result: {
        compressedData,
        originalSize: imageData.byteLength,
        compressedSize: compressedData.byteLength,
        compressionRatio: Math.round((1 - compressedData.byteLength / imageData.byteLength) * 100),
        width,
        height,
        mimeType,
        fileName: `${originalName}.${extension}`
      }
    }

    self.postMessage(response, [compressedData])
  } catch (error) {
    const response: WorkerResponse = {
      type: 'error',
      id,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
    self.postMessage(response)
  }
}

export {}
