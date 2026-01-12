import { z } from 'zod'

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres')
      .trim(),
    email: z
      .string()
      .email('Email inválido')
      .max(255, 'Email deve ter no máximo 255 caracteres')
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .max(100, 'Senha deve ter no máximo 100 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial'
      )
  })
})

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido').toLowerCase().trim(),
    password: z.string().min(1, 'Senha é obrigatória')
  })
})

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token é obrigatório')
  })
})

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido').toLowerCase().trim()
  })
})

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token é obrigatório'),
    password: z
      .string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .max(100, 'Senha deve ter no máximo 100 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial'
      )
  })
})

export type RegisterInput = z.infer<typeof registerSchema>['body']
export type LoginInput = z.infer<typeof loginSchema>['body']
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body']
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body']
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body']
