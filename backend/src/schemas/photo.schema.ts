import { z } from 'zod'

export const createPhotoSchema = z.object({
  params: z.object({
    albumId: z.string().uuid('ID do álbum inválido')
  }),
  body: z.object({
    title: z
      .string()
      .max(200, 'Título deve ter no máximo 200 caracteres')
      .trim()
      .optional(),
    description: z
      .string()
      .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
      .trim()
      .optional(),
    filename: z.string().min(1, 'Nome do arquivo é obrigatório'),
    originalName: z.string().min(1, 'Nome original é obrigatório'),
    mimeType: z.string().min(1, 'Tipo MIME é obrigatório'),
    size: z.number().positive('Tamanho deve ser positivo'),
    s3Key: z.string().min(1, 'Chave S3 é obrigatória'),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    dominantColor: z.string().optional(),
    acquisitionDate: z
      .string()
      .optional()
      .transform((val: string | undefined) => {
        if (!val) return undefined
        const date = new Date(val)
        return isNaN(date.getTime()) ? undefined : date.toISOString()
      }),
    exifData: z.record(z.unknown()).optional()
  })
})

export const updatePhotoSchema = z.object({
  params: z.object({
    albumId: z.string().uuid('ID do álbum inválido'),
    id: z.string().uuid('ID da foto inválido')
  }),
  body: z.object({
    title: z
      .string()
      .min(1, 'Título é obrigatório')
      .max(200, 'Título deve ter no máximo 200 caracteres')
      .trim()
      .optional(),
    description: z
      .string()
      .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
      .trim()
      .optional(),
    acquisitionDate: z
      .string()
      .optional()
      .transform((val: string | undefined) => {
        if (!val) return undefined
        const date = new Date(val)
        return isNaN(date.getTime()) ? undefined : date.toISOString()
      }),
    dominantColor: z.string().optional()
  })
})

export const photoIdParamSchema = z.object({
  params: z.object({
    albumId: z.string().uuid('ID do álbum inválido'),
    id: z.string().uuid('ID da foto inválido')
  })
})

export const listPhotosSchema = z.object({
  params: z.object({
    albumId: z.string().uuid('ID do álbum inválido')
  }),
  query: z.object({
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('20'),
    sortBy: z.enum(['title', 'acquisitionDate', 'createdAt', 'size']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  })
})

export const uploadUrlSchema = z.object({
  params: z.object({
    albumId: z.string().uuid('ID do álbum inválido')
  }),
  body: z.object({
    filename: z.string().min(1, 'Nome do arquivo é obrigatório'),
    contentType: z
      .string()
      .refine(
        (type: string) =>
          ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'].includes(
            type
          ),
        'Tipo de arquivo não suportado'
      )
  })
})

export const batchUploadUrlSchema = z.object({
  params: z.object({
    albumId: z.string().uuid('ID do álbum inválido')
  }),
  body: z.object({
    files: z
      .array(
        z.object({
          filename: z.string().min(1, 'Nome do arquivo é obrigatório'),
          contentType: z
            .string()
            .refine(
              (type: string) =>
                ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'].includes(
                  type
                ),
              'Tipo de arquivo não suportado'
            )
        })
      )
      .min(1, 'Pelo menos um arquivo é necessário')
      .max(50, 'Máximo de 50 arquivos por vez')
  })
})

export const processMetadataSchema = z.object({
  params: z.object({
    albumId: z.string().uuid('ID do álbum inválido'),
    id: z.string().uuid('ID da foto inválido')
  })
})

export type CreatePhotoInput = z.infer<typeof createPhotoSchema>['body']
export type UpdatePhotoInput = z.infer<typeof updatePhotoSchema>['body']
export type ListPhotosQuery = z.infer<typeof listPhotosSchema>['query']
export type UploadUrlInput = z.infer<typeof uploadUrlSchema>['body']
export type BatchUploadUrlInput = z.infer<typeof batchUploadUrlSchema>['body']
