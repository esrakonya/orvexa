import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/apiClient'
import { useAuth } from '../contexts/AuthContext'

interface LoginLocationState {
  message?: string
  from?: {
    pathname?: string
  }
}

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const navigationState = location.state as LoginLocationState | null
  const successMessage = navigationState?.message
  const returnPath = navigationState?.from?.pathname ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login({ email: email.trim(), password })
      navigate(returnPath, { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('E-posta veya parola hatalı.')
      } else if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Orvexa
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Çalışma alanınıza giriş yapın.
          </p>
        </div>

        {successMessage && (
          <p
            role="status"
            className="mb-5 rounded-lg bg-success-50 px-3 py-2.5 text-sm text-success-700"
          >
            {successMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              E-posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={255}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="ornek@firma.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Parola
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={72}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="Parolanız"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-danger-50 px-3 py-2.5 text-sm text-danger-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Giriş yapılıyor…' : 'Giriş yap'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Henüz hesabınız yok mu?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary-600 hover:text-primary-700"
          >
            Hesap oluşturun
          </Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage