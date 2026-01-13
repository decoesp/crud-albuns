import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Image, Check, X } from 'lucide-react'
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
  const [password, setPassword] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  })

  const passwordRequirements = [
    { label: 'Pelo menos 8 caracteres', test: (pwd: string) => pwd.length >= 8 },
    { label: 'Uma letra maiúscula', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: 'Uma letra minúscula', test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: 'Um número', test: (pwd: string) => /\d/.test(pwd) },
    { label: 'Um caractere especial (@$!%*?&)', test: (pwd: string) => /[@$!%*?&]/.test(pwd) }
  ]

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

            <div>
              <Input
                id="password"
                type="password"
                label="Senha"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password', {
                  onChange: (e) => setPassword(e.target.value)
                })}
              />
              {password && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-2">Requisitos da senha:</p>
                  <ul className="space-y-1">
                    {passwordRequirements.map((req, index) => {
                      const isValid = req.test(password)
                      return (
                        <li key={index} className="flex items-center gap-2 text-xs">
                          {isValid ? (
                            <Check className="w-3 h-3 text-green-600" aria-hidden="true" />
                          ) : (
                            <X className="w-3 h-3 text-gray-400" aria-hidden="true" />
                          )}
                          <span className={isValid ? 'text-green-700' : 'text-gray-600'}>
                            {req.label}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>

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
