import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from './env.js'

export const s3Client = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY
  },
  forcePathStyle: env.S3_USE_PATH_STYLE
})

export async function generateUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: contentType
  })

  return getSignedUrl(s3Client, command, { expiresIn })
}

export async function generateDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key
  })

  return getSignedUrl(s3Client, command, { expiresIn })
}

export async function getObject(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key
  })

  const response = await s3Client.send(command)
  const stream = response.Body as NodeJS.ReadableStream
  
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(chunk as Buffer)
  }
  
  return Buffer.concat(chunks)
}

export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key
  })

  await s3Client.send(command)
}
