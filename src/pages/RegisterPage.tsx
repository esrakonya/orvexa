import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/apiClient'
import { useAuth } from '../contexts/AuthContext' // 1. AuthContext'i ekledik
import { register } from '../services/authService'
import {
  previewWorkspaceInvitation,
  registerAndAcceptWorkspaceInvitation,
  type WorkspaceInvitationPreviewResponse,
} from '../services/workspaceInvitationService'

function RegisterPage() {
  const navigate = useNavigate()
  const { login: loginUser, refreshUser } = useAuth() // 2. Otomatik giriş fonksiyonlarını aldık

  const [searchParams] = useSearchParams()
  const invitationToken = searchParams.get('invite')
  const [invitation, setInvitation] = useState<WorkspaceInvitationPreviewResponse | null>(null)
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [industry, setIndustry] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!invitationToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInvitation(null)
      return
    }

    let cancelled = false

    async function loadInvitation() {
      setIsLoadingInvitation(true)
      setError('')

      try {
        const result = await previewWorkspaceInvitation(invitationToken!)

        if (!cancelled) {
          setInvitation(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Unable to load invitation details. Please check the link.',
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoadingInvitation(false)
        }
      }
    }

    void loadInvitation()

    return () => {
      cancelled = true
    }
  }, [invitationToken])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    // Davet ile gelindiyse davetteki e-postayı, normal kayıt ise girilen e-postayı alıyoruz
    const resolvedEmail = invitationToken ? (invitation?.email ?? '') : email.trim()

    try {
      if (invitationToken) {
        await registerAndAcceptWorkspaceInvitation({
          token: invitationToken,
          name: name.trim(),
          password,
        })
      } else {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          workspaceName: workspaceName.trim(),
          industry: industry.trim() || undefined,
        })
      }

      // 3. BURASI DEĞİŞTİ: Kayıt başarılı olunca arka planda otomatik login yapıyoruz
      await loginUser({
        email: resolvedEmail,
        password: password,
      })

      // 4. State'i güncelliyor ve ana sayfaya yönlendiriyoruz
      await refreshUser()
      navigate('/', { replace: true })

    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('This email address may already be registered.')
      } else if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Something went wrong while creating your account. Please try again.')
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
            {invitationToken
              ? 'Create an account to join your invited workspace.'
              : 'Create your new workspace.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-forest"
            >
              Full Name
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
              className="w-full rounded-lg border border-sage-mist px-3 py-2.5 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage-mist"
              placeholder="Enter your full name"
            />
          </div>

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
              required={!invitationToken}
              maxLength={255}
              value={invitationToken ? invitation?.email ?? '' : email}
              readOnly={Boolean(invitationToken)}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-sage-mist px-3 py-2.5 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage-mist"
              placeholder="ornek@firma.com"
            />

            {invitationToken && isLoadingInvitation && (
              <p className="mt-1 text-xs text-sage">
                Loading invitation email…
              </p>
            )}
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
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={72}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-sage-mist px-3 py-2.5 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage-mist"
              placeholder="At least 12 characters"
            />
            <p className="mt-1 text-xs text-sage">
              Your password must be between 12 and 72 characters.
            </p>
          </div>

          {!invitationToken && (
            <>
              <div>
                <label
                  htmlFor="workspaceName"
                  className="mb-1.5 block text-sm font-medium text-forest"
                >
                  Workspace Name
                </label>
                <input
                  id="workspaceName"
                  name="workspaceName"
                  type="text"
                  required
                  maxLength={100}
                  value={workspaceName}
                  onChange={(event) => setWorkspaceName(event.target.value)}
                  className="w-full rounded-lg border border-sage-mist px-3 py-2.5 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage-mist"
                  placeholder="e.g. Acme Studio"
                />
              </div>

              <div>
                <label
                  htmlFor="industry"
                  className="mb-1.5 block text-sm font-medium text-forest"
                >
                  Industry <span className="font-normal text-sage">(optional)</span>
                </label>
                <input
                  id="industry"
                  name="industry"
                  type="text"
                  maxLength={100}
                  value={industry}
                  onChange={(event) => setIndustry(event.target.value)}
                  className="w-full rounded-lg border border-sage-mist px-3 py-2.5 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage-mist"
                  placeholder="e.g. Software, consulting"
                />
              </div>
            </>
          )}

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
            disabled={isSubmitting || (Boolean(invitationToken) && isLoadingInvitation)}
            className="w-full rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-forest-dark focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating account…' : invitationToken ? 'Accept Invitation & Register' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-sage">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-forest hover:underline focus:outline-none"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  )
}

export default RegisterPage