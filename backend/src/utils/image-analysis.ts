import sharp from 'sharp'
import exifParser from 'exif-parser'
import { getColorFromURL } from 'color-thief-node'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

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
        console.warn('Failed to parse EXIF data:', exifError)
      }
    }

    const dominantColor = await extractDominantColor(buffer)
    metadata.dominantColor = dominantColor

  } catch (error) {
    console.error('Error extracting image metadata:', error)
  }

  return metadata
}

export async function extractDominantColor(buffer: Buffer): Promise<string | null> {
  try {
    const tempDir = os.tmpdir()
    const tempFilePath = path.join(tempDir, `temp-${Date.now()}.jpg`)
    
    await sharp(buffer)
      .resize(100, 100, { fit: 'cover' })
      .jpeg()
      .toFile(tempFilePath)

    const color = await getColorFromURL(tempFilePath)
    
    await fs.unlink(tempFilePath)

    const hexColor = rgbToHex(color[0], color[1], color[2])
    return hexColor
  } catch (error) {
    console.error('Error extracting dominant color:', error)
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
