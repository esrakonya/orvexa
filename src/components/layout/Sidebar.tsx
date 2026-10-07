import { NavLink } from 'react-router-dom'
import { navigationItems } from '../../constants/navigation'

interface SidebarProps {
  isOpen: boolean
  onNavigate: () => void
}

function Sidebar({ isOpen, onNavigate }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onNavigate}
          aria-label="Close navigation menu"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white
          transition-transform duration-200
          md:static md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-xl font-bold tracking-tight">
            Orvexa
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigationItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar