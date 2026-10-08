import type { ClientStatus } from '../../interfaces/Client'

export interface ClientFiltersState {
    search: string
    status: ClientStatus | ''
    industry: string
}

interface ClientFiltersProps {
    filters: ClientFiltersState
    industries: string[]
    onChange: (filters: ClientFiltersState) => void
}

const statusLabels: Record<ClientStatus, string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
}

function ClientFilters({
    filters,
    industries,
    onChange,
}: ClientFiltersProps) {
    const handleSearchChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        onChange({
            ...filters,
            search: event.target.value,
        })
    }

    const handleStatusChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        onChange({
            ...filters,
            status: event.target.value as ClientStatus | '',
        })
    }

    const handleIndustryChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        onChange({
            ...filters,
            industry: event.target.value,
        })
    }

    const handleClear = () => {
        onChange({
            search: '',
            status: '',
            industry: '',
        })
    }

    const hasActiveFilters =
        filters.search.trim() !== '' ||
        filters.status !== '' ||
        filters.industry !== ''

    return (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px_200px_auto]">
                <div>
                    <label
                        htmlFor="client-search"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Search
                    </label>

                    <input
                        id="client-search"
                        type="search"
                        value={filters.search}
                        onChange={handleSearchChange}
                        placeholder="Search by name or email..."
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                    />
                </div>

                <div>
                    <label
                        htmlFor="client-status"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Status
                    </label>

                    <select
                        id="client-status"
                        value={filters.status}
                        onChange={handleStatusChange}
                        className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                    >
                        <option value="">All statuses</option>

                        {(Object.keys(statusLabels) as ClientStatus[]).map(
                            (status) => (
                                <option key={status} value={status}>
                                    {statusLabels[status]}
                                </option>
                            ),
                        )}
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="client-industry"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Industry
                    </label>

                    <select
                        id="client-industry"
                        value={filters.industry}
                        onChange={handleIndustryChange}
                        className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                    >
                        <option value="">All industries</option>

                        {industries.map((industry) => (
                            <option key={industry} value={industry}>
                                {industry}
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

export default ClientFilters