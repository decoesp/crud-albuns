
export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  outputFormat?: 'webp' | 'jpeg' | 'png'
}

export interface CompressionResult {
  id: string 
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
  width: number
  height: number
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.8,
  outputFormat: 'webp'
}

function supportsWebP(): boolean {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL('image/webp').startsWith('data:image/webp')
}

function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    webp: 'image/webp',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png'
  }
  return mimeTypes[format] || 'image/jpeg'
}

function getExtension(format: string): string {
  return format === 'jpeg' ? 'jpg' : format
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  if (opts.outputFormat === 'webp' && !supportsWebP()) {
    opts.outputFormat = 'jpeg'
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      let { width, height } = img

      if (width > opts.maxWidth || height > opts.maxHeight) {
        const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      canvas.width = width
      canvas.height = height

      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'))
            return
          }

          const originalName = file.name.replace(/\.[^/.]+$/, '')
          const extension = getExtension(opts.outputFormat)
          const compressedFile = new File(
            [blob],
            `${originalName}.${extension}`,
            { type: getMimeType(opts.outputFormat) }
          )

          resolve({
            id: crypto.randomUUID(),
            file: compressedFile,
            originalSize: file.size,
            compressedSize: blob.size,
            compressionRatio: Math.round((1 - blob.size / file.size) * 100),
            width,
            height
          })
        },
        getMimeType(opts.outputFormat),
        opts.quality
      )
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = URL.createObjectURL(file)
  })
}

export async function compressImages(
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (completed: number, total: number) => void
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = []
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    if (!file.type.startsWith('image/')) {
      continue
    }

    try {
      const result = await compressImage(file, options)
      results.push(result)
    } catch (error) {
      console.error(`Failed to compress ${file.name}:`, error)
      results.push({
        id: crypto.randomUUID(),
        file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0,
        width: 0,
        height: 0
      })
    }

    onProgress?.(i + 1, files.length)
  }

  return results
}

export function shouldCompress(file: File, maxSizeKB: number = 500): boolean {
  return file.size > maxSizeKB * 1024
}

export function formatCompressionStats(results: CompressionResult[]): string {
  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0)
  const totalCompressed = results.reduce((sum, r) => sum + r.compressedSize, 0)
  const savedBytes = totalOriginal - totalCompressed
  const savedPercent = Math.round((savedBytes / totalOriginal) * 100)
  
  return `Economizado: ${formatBytes(savedBytes)} (${savedPercent}%)`
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
