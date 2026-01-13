declare module 'exif-parser' {
  interface ExifTags {
    DateTimeOriginal?: number
    CreateDate?: number
    Make?: string
    Model?: string
    ExposureTime?: number
    FNumber?: number
    ISO?: number
    FocalLength?: number
    [key: string]: unknown
  }

  interface ExifResult {
    tags: ExifTags
    imageSize?: {
      width: number
      height: number
    }
    thumbnailOffset?: number
    thumbnailLength?: number
    thumbnailType?: number
  }

  interface ExifParserInstance {
    parse(): ExifResult
  }

  function create(buffer: Buffer): ExifParserInstance

  export { create, ExifTags, ExifResult, ExifParserInstance }
}
