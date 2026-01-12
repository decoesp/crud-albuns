import { z } from 'zod'

export const createAlbumSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Título é obrigatório')
      .max(200, 'Título deve ter no máximo 200 caracteres')
      .trim(),
    description: z
      .string()
      .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
      .trim()
      .optional()
  })
})

export const updateAlbumSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID do álbum inválido')
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
      .optional()
  })
})

export const albumIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID do álbum inválido')
  })
})

export const shareAlbumSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID do álbum inválido')
  }),
  body: z.object({
    isPublic: z.boolean()
  })
})

export const listAlbumsSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('10'),
    sortBy: z.enum(['title', 'createdAt', 'updatedAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().optional()
  })
})

export type CreateAlbumInput = z.infer<typeof createAlbumSchema>['body']
export type UpdateAlbumInput = z.infer<typeof updateAlbumSchema>['body']
export type ListAlbumsQuery = z.infer<typeof listAlbumsSchema>['query']
