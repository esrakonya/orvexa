import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/apiClient'
import { register } from '../services/authService'

function RegisterPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [industry, setIndustry] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        workspaceName: workspaceName.trim(),
        industry: industry.trim() || undefined,
      })

      navigate('/login', {
        replace: true,
        state: { message: 'Hesabınız oluşturuldu. Giriş yapabilirsiniz.' },
      })
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Bu e-posta adresi zaten kayıtlı olabilir.')
      } else if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.')
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
            Yeni çalışma alanınızı oluşturun.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Ad soyad
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="Adınız ve soyadınız"
            />
          </div>

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
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
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
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={72}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="En az 12 karakter"
            />
            <p className="mt-1 text-xs text-gray-500">
              Parolanız 12–72 karakter arasında olmalıdır.
            </p>
          </div>

          <div>
            <label
              htmlFor="workspaceName"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Çalışma alanı adı
            </label>
            <input
              id="workspaceName"
              name="workspaceName"
              type="text"
              required
              maxLength={100}
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="Örn. Acme Studio"
            />
          </div>

          <div>
            <label
              htmlFor="industry"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Sektör <span className="font-normal text-gray-400">(isteğe bağlı)</span>
            </label>
            <input
              id="industry"
              name="industry"
              type="text"
              maxLength={100}
              value={industry}
              onChange={(event) => setIndustry(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="Örn. Yazılım, danışmanlık"
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
            {isSubmitting ? 'Hesap oluşturuluyor…' : 'Hesap oluştur'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Zaten hesabınız var mı?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:text-primary-700"
          >
            Giriş yapın
          </Link>
        </p>
      </section>
    </main>
  )
}

export default RegisterPage