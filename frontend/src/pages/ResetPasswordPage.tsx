import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Image } from 'lucide-react'
import api from '../lib/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Senha deve conter maiúscula, minúscula, número e caractere especial'
    ),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const token = searchParams.get('token')

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema)
  })

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast.error('Token inválido')
      return
    }

    setIsLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password: data.password })
      toast.success('Senha alterada com sucesso!')
      navigate('/login')
    } catch {
      toast.error('Token inválido ou expirado')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="card p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Link inválido</h1>
          <p className="text-gray-600 mb-4">O link de recuperação é inválido ou expirou.</p>
          <Link to="/forgot-password">
            <Button>Solicitar novo link</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Image className="w-16 h-16 text-primary-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Nova Senha</h1>
          <p className="mt-2 text-gray-600">Digite sua nova senha</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              id="password"
              type="password"
              label="Nova Senha"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              id="confirmPassword"
              type="password"
              label="Confirmar Senha"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Alterar Senha
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
