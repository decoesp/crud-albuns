import sharp from 'sharp'
import { logger } from './logger.js'
import exifParser from 'exif-parser'

export interface ImageMetadata {
  width: number
  height: number
  dominantColor: string | null
  acquisitionDate: Date | null
  exifData: Record<string, unknown> | null
}

export async function extractImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
  const metadata: ImageMetadata = {
    width: 0,
    height: 0,
    dominantColor: null,
    acquisitionDate: null,
    exifData: null
  }

  try {
    const imageInfo = await sharp(buffer).metadata()
    metadata.width = imageInfo.width || 0
    metadata.height = imageInfo.height || 0

    if (imageInfo.exif) {
      try {
        const parser = exifParser.create(imageInfo.exif)
        const exifResult = parser.parse()
        
        metadata.exifData = exifResult.tags as Record<string, unknown>

        if (exifResult.tags.DateTimeOriginal) {
          metadata.acquisitionDate = new Date(exifResult.tags.DateTimeOriginal * 1000)
        } else if (exifResult.tags.CreateDate) {
          metadata.acquisitionDate = new Date(exifResult.tags.CreateDate * 1000)
        }
      } catch (exifError) {
        logger.warn('Failed to parse EXIF data', 'ImageAnalysis', { error: String(exifError) })
      }
    }

    const dominantColor = await extractDominantColor(buffer)
    metadata.dominantColor = dominantColor

  } catch (error) {
    logger.error('Error extracting image metadata', 'ImageAnalysis', { error: String(error) })
  }

  return metadata
}

export async function extractDominantColor(buffer: Buffer): Promise<string | null> {
  try {
    const image = sharp(buffer)
    const { dominant } = await image.stats()
    
    const r = Math.round(dominant.r)
    const g = Math.round(dominant.g)
    const b = Math.round(dominant.b)
    
    return rgbToHex(r, g, b)
  } catch (error) {
    logger.error('Error extracting dominant color', 'ImageAnalysis', { error: String(error) })
    return null
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    })
    .join('')
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
}

export function extractTitleFromFilename(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
  
  return nameWithoutExt
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
