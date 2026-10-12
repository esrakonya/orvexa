import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { ApiError } from "../api/apiClient"
import { useAuth } from "../contexts/AuthContext"
import {
  acceptWorkspaceInvitation,
  previewWorkspaceInvitation,
  type WorkspaceInvitationPreviewResponse,
} from "../services/workspaceInvitationService"

function AcceptInvitationPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

  const [invitation, setInvitation] =
    useState<WorkspaceInvitationPreviewResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    let cancelled = false

    async function loadInvitation() {
      if (!token) {
        setError("No invitation token was found in the link.")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError("")

      try {
        const result = await previewWorkspaceInvitation(token)

        if (!cancelled) {
          setInvitation(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Unable to load invitation details. Please check the link.",
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadInvitation()

    return () => {
      cancelled = true
    }
  }, [token])

  async function handleAcceptInvitation(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!token) {
      setError("Invitation token not found.")
      return
    }

    setError("")
    setSuccessMessage("")
    setIsAccepting(true)

    try {
      await acceptWorkspaceInvitation({ token })
      setSuccessMessage(
        "Invitation accepted. Redirecting you to your workspace.",
      )
      navigate("/dashboard", { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to accept the invitation. Please try again.",
      )
    } finally {
      setIsAccepting(false)
    }
  }

  if (isLoading || isAuthLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ivory px-4">
        <p className="text-sm text-sage">
          Checking invitation…
        </p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-sage-mist bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-forest">
            Orvexa
          </h1>
          <p className="mt-2 text-sm text-sage">
            Workspace Invitation
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-5 rounded-lg bg-danger-50 px-3 py-2.5 text-sm text-danger-700"
          >
            {error}
          </p>
        )}

        {invitation && (
          <>
            <div className="rounded-xl border border-sage-mist bg-ivory p-4">
              <p className="text-sm text-sage">
                Invited Workspace
              </p>

              <h2 className="mt-1 text-lg font-semibold text-forest">
                {invitation.workspaceName}
              </h2>

              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-sage">Email Address</dt>
                  <dd className="font-medium text-forest">
                    {invitation.email}
                  </dd>
                </div>

                <div>
                  <dt className="text-sage">Role</dt>
                  <dd className="font-medium text-forest">
                    {invitation.role}
                  </dd>
                </div>

                <div>
                  <dt className="text-sage">Expires At</dt>
                  <dd className="font-medium text-forest">
                    {new Date(invitation.expiresAt).toLocaleString("en-US")}
                  </dd>
                </div>
              </dl>
            </div>

            <p className="mt-5 text-sm text-sage">
              {isAuthenticated
                ? "Select the button below to accept this invitation. Your signed-in email address must match the address the invitation was sent to."
                : "Sign in or create a new account through this invitation to join the workspace."}
            </p>

            <div className="mt-5 space-y-3">
              {isAuthenticated ? (
                <form onSubmit={handleAcceptInvitation}>
                  {successMessage && (
                    <p
                      role="status"
                      className="mb-3 text-sm text-green-700"
                    >
                      {successMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isAccepting}
                    className="w-full rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#10352c] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isAccepting
                      ? "Accepting invitation…"
                      : "Accept Invitation"}
                  </button>
                </form>
              ) : (
                <>
                  <Link
                    to="/login"
                    state={{
                      from: {
                        pathname: "/accept-invitation",
                        search: `?token=${encodeURIComponent(token ?? "")}`,
                      },
                    }}
                    className="block w-full rounded-lg bg-forest px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#10352c]"
                  >
                    Sign In
                  </Link>

                  <Link
                    to={`/register?invite=${encodeURIComponent(token ?? "")}`}
                    className="block w-full rounded-lg border border-sage-mist px-4 py-2.5 text-center text-sm font-semibold text-forest transition hover:bg-ivory"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </>
        )}

        {!invitation && !error && (
          <p className="text-sm text-sage">
            Invitation details are unavailable.
          </p>
        )}

        <p className="mt-6 text-center text-sm text-sage">
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className="font-semibold text-forest hover:text-sage"
          >
            {isAuthenticated ? "Back to Dashboard" : "Back to Sign In"}
          </Link>
        </p>
      </section>
    </main>
  )
}

export default AcceptInvitationPage