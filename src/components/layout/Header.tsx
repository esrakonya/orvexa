import { Menu } from "lucide-react"

interface HeaderProps {
    onMenuClick: () => void
}

function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="h-16 border-b bg-white">
            <div className="flex h-full items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onMenuClick}
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
                        aria-label="Open navigation menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <h1 className="text-sm font-semibold text-gray-900">
                        Orvexa
                    </h1>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                    <span className="text-sm font-medium text-gray-700">
                        E
                    </span>
                </div>
            </div>
        </header>
    )
}

export default Header