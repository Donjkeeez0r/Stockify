import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/services/api/axios'
import { useAuthStore } from '@/stores/auth-store'
import type { UserRole } from '@/lib/types'

type AuthMode = 'login' | 'register'

type LoginResponse = {
  access_token: string
}

type ApiErrorResponse = {
  message?: string | string[]
}

const extractApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as ApiErrorResponse | undefined

    if (Array.isArray(payload?.message)) {
      return payload.message.join(', ')
    }

    if (payload?.message) {
      return payload.message
    }
  }

  return 'Произошла ошибка. Попробуйте снова.'
}

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('WORKER')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const setToken = useAuthStore((state) => state.setToken)
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setIsLoading(true)

    try {
      if (mode === 'register') {
        await api.post('/auth/register', {
          email,
          password,
          role,
        })

        setSuccessMessage('Регистрация успешна. Выполняем вход...')
      }

      const loginResponse = await api.post<LoginResponse>('/auth/login', {
        email,
        password,
      })

      setToken(loginResponse.data.access_token)
      navigate('/', { replace: true })
    } catch (submitError) {
      setError(extractApiError(submitError))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground dark">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl">Stockify Auth</CardTitle>
          <CardDescription>
            {mode === 'login'
              ? 'Войдите в аккаунт, чтобы управлять инвентарём'
              : 'Создайте аккаунт, чтобы получить доступ к системе'}
          </CardDescription>
          <div className="grid grid-cols-2 gap-2 rounded-md border border-border p-1">
            <Button
              type="button"
              variant={mode === 'login' ? 'default' : 'ghost'}
              onClick={() => {
                setMode('login')
                setError(null)
                setSuccessMessage(null)
              }}
            >
              Вход
            </Button>
            <Button
              type="button"
              variant={mode === 'register' ? 'default' : 'ghost'}
              onClick={() => {
                setMode('register')
                setError(null)
                setSuccessMessage(null)
              }}
            >
              Регистрация
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />

            {mode === 'register' ? (
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="WORKER">WORKER</option>
                <option value="MANAGER">MANAGER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            ) : null}

            {error ? <p className="text-xs text-red-400">{error}</p> : null}
            {successMessage ? <p className="text-xs text-emerald-400">{successMessage}</p> : null}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? mode === 'login'
                  ? 'Входим...'
                  : 'Создаём аккаунт...'
                : mode === 'login'
                  ? 'Войти'
                  : 'Зарегистрироваться'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
