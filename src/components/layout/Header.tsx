import { useState } from "react"
import { LogOut, Menu } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

interface HeaderProps {
    onMenuClick: () => void
}

function Header({ onMenuClick }: HeaderProps) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [error, setError] = useState("")

    const initials = user?.name
        ?.trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toLocaleUpperCase("tr-TR"))
        .join("") || "?"

    async function handleLogout() {
        setError("")
        setIsLoggingOut(true)

        try {
            await logout()
            navigate("/login", {
                replace: true,
                state: { message: "Başarıyla çıkış yaptınız." },
            })
        } catch {
            setError("Çıkış yapılırken bir hata oluştu. Lütfen tekrar deneyin.")
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <header className="min-h-16 border-b bg-white">
            <div className="flex min-h-16 items-center justify-between gap-4 px-6">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onMenuClick}
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
                        aria-label="Menüyü aç"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <h1 className="text-sm font-semibold text-gray-900">
                        Orvexa
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    {user && (
                        <span
                            className="hidden text-sm text-gray-600 sm:inline"
                            title={user.email}
                        >
                            {user.name}
                        </span>
                    )}

                    <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200"
                        title={user?.name ?? "Kullanıcı"}
                        aria-label={`Kullanıcı: ${ user?.name ?? "Bilinmiyor" } `}
                    >
                        <span className="text-sm font-medium text-gray-700">
                            {initials}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>
                            {isLoggingOut ? "Çıkış yapılıyor…" : "Çıkış yap"}
                        </span>
                    </button>
                </div>
            </div>

            {error && (
                <p
                    role="alert"
                    className="px-6 pb-3 text-sm text-red-600"
                >
                    {error}
                </p>
            )}
        </header>
    )
}

export default Header
