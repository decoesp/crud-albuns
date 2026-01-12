import sharp from 'sharp'
import ExifParser from 'exif-parser'
import { PhotoMetadata } from '../types/index.js'

export async function extractImageMetadata(buffer: Buffer): Promise<PhotoMetadata> {
  const metadata: PhotoMetadata = {}

  try {
    const sharpMetadata = await sharp(buffer).metadata()
    metadata.width = sharpMetadata.width
    metadata.height = sharpMetadata.height
  } catch {
    console.warn('[IMAGE] Could not extract dimensions')
  }

  try {
    metadata.dominantColor = await extractDominantColor(buffer)
  } catch {
    console.warn('[IMAGE] Could not extract dominant color')
  }

  try {
    const exifData = extractExifData(buffer)
    if (exifData) {
      metadata.exifData = exifData.tags as Record<string, unknown>
      if (exifData.tags?.DateTimeOriginal) {
        metadata.acquisitionDate = new Date(exifData.tags.DateTimeOriginal * 1000)
      }
    }
  } catch {
    console.warn('[IMAGE] Could not extract EXIF data')
  }

  return metadata
}

async function extractDominantColor(buffer: Buffer): Promise<string> {
  const { data, info } = await sharp(buffer)
    .resize(50, 50, { fit: 'cover' })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const pixels: number[][] = []
  for (let i = 0; i < data.length; i += info.channels) {
    pixels.push([data[i], data[i + 1], data[i + 2]])
  }

  const colorCounts = new Map<string, number>()
  for (const pixel of pixels) {
    const quantized = pixel.map((c) => Math.round(c / 32) * 32)
    const key = quantized.join(',')
    colorCounts.set(key, (colorCounts.get(key) || 0) + 1)
  }

  let maxCount = 0
  let dominantColor = [128, 128, 128]
  for (const [key, count] of colorCounts) {
    if (count > maxCount) {
      maxCount = count
      dominantColor = key.split(',').map(Number)
    }
  }

  return rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2])
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

function extractExifData(buffer: Buffer): { tags: Record<string, unknown> } | null {
  try {
    const parser = ExifParser.create(buffer)
    return parser.parse()
  } catch {
    return null
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function isValidImageMimeType(mimeType: string): boolean {
  const validTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff'
  ]
  return validTypes.includes(mimeType)
}
