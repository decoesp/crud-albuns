import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Image, ArrowLeft } from 'lucide-react'
import api from '../lib/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido')
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true)
    try {
      await api.post('/auth/forgot-password', data)
      setIsSubmitted(true)
      toast.success('Verifique seu email!')
    } catch {
      toast.error('Erro ao enviar email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Image className="w-16 h-16 text-primary-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Recuperar Senha</h1>
          <p className="mt-2 text-gray-600">
            {isSubmitted
              ? 'Verifique seu email para redefinir sua senha'
              : 'Digite seu email para receber o link de recuperação'}
          </p>
        </div>

        <div className="card p-8">
          {isSubmitted ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600">
                Se o email existir em nossa base, você receberá um link para redefinir sua senha.
              </p>
              <Link to="/login">
                <Button variant="secondary" className="mt-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                id="email"
                type="email"
                label="E-mail"
                placeholder="seu@email.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <div className="flex gap-3">
                <Link to="/login" className="flex-1">
                  <Button type="button" variant="secondary" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                </Link>
                <Button type="submit" className="flex-1" isLoading={isLoading}>
                  Enviar
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
