import type { UserRole } from '../../interfaces/User'

export interface TeamFiltersState {
  search: string
  role: UserRole | ''
}

interface TeamFiltersProps {
  filters: TeamFiltersState
  onChange: (filters: TeamFiltersState) => void
}

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Admin',
  PROJECT_MANAGER: 'Project Manager',
  MEMBER: 'Member',
}

function TeamFilters({
  filters,
  onChange,
}: TeamFiltersProps) {
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onChange({
      ...filters,
      search: event.target.value,
    })
  }

  const handleRoleChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    onChange({
      ...filters,
      role: event.target.value as UserRole | '',
    })
  }

  const handleClear = () => {
    onChange({
      search: '',
      role: '',
    })
  }

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.role !== ''

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto]">
        <div>
          <label
            htmlFor="team-search"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Search
          </label>

          <input
            id="team-search"
            type="search"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search by name or email..."
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div>
          <label
            htmlFor="team-role"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Role
          </label>

          <select
            id="team-role"
            value={filters.role}
            onChange={handleRoleChange}
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          >
            <option value="">All roles</option>

            {(
              Object.keys(roleLabels) as UserRole[]
            ).map((role) => (
              <option key={role} value={role}>
                {roleLabels[role]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleClear}
            disabled={!hasActiveFilters}
            className="w-full rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}

export default TeamFilters