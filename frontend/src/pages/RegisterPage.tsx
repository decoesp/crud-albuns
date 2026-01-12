import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Image } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Senha deve conter maiúscula, minúscula, número e caractere especial'
    )
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      await registerUser(data.name, data.email, data.password)
      toast.success('Cadastro realizado com sucesso!')
    } catch {
      toast.error('Erro ao criar conta. Email pode já estar em uso.')
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
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Meus Álbuns de Fotos</h1>
          <p className="mt-2 text-gray-600">Faça seu cadastro:</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              id="name"
              type="text"
              label="Nome"
              placeholder="Seu nome"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              id="email"
              type="email"
              label="E-mail"
              placeholder="seu@email.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="password"
              type="password"
              label="Senha"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex gap-3">
              <Link to="/login" className="flex-1">
                <Button type="button" variant="secondary" className="w-full">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" className="flex-1" isLoading={isLoading}>
                Concluir
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
