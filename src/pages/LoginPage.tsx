import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/apiClient'
import { useAuth } from '../contexts/AuthContext'

interface LoginLocationState {
  message?: string
  from?: {
    pathname?: string
    search?: string
  }
}

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const navigationState = location.state as LoginLocationState | null
  const successMessage = navigationState?.message
  const returnPath = navigationState?.from?.pathname ?? '/dashboard'
  const returnSearch = navigationState?.from?.search ?? ''

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
      navigate(`${returnPath}${returnSearch}`, { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Invalid email or password.')
      } else if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Something went wrong while signing in. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-sage-mist bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-forest">
            Orvexa
          </h1>
          <p className="mt-2 text-sm text-sage">
            Sign in to your workspace.
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
              className="mb-1.5 block text-sm font-medium text-forest"
            >
              Email Address
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
              className="w-full rounded-lg border border-sage-mist px-3 py-2.5 text-sm outline-none transition focus:border-sage focus:ring-2 focus:ring-sage-mist"
              placeholder="ornek@firma.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-forest"
            >
              Password
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
              className="w-full rounded-lg border border-sage-mist px-3 py-2.5 text-sm outline-none transition focus:border-sage focus:ring-2 focus:ring-sage-mist"
              placeholder="Passwordnız"
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
            className="w-full rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#10352c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-sage">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-forest hover:text-sage"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage