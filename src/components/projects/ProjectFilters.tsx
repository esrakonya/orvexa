import type { ProjectStatus } from '../../interfaces/Project'

export interface ProjectFiltersState {
    search: string
    status: ProjectStatus | ''
    clientId: string
}

interface ProjectFiltersProps {
    filters: ProjectFiltersState
    clients: {
        id: string
        name: string
    }[]
    onChange: (
        filters: ProjectFiltersState,
    ) => void
}

function ProjectFilters({
    filters,
    clients,
    onChange,
}: ProjectFiltersProps) {
    const hasActiveFilters =
        filters.search !== '' ||
        filters.status !== '' ||
        filters.clientId !== ''

    return (
        <div className="mt-6 rounded-xl border bg-white p-4">
            <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_auto]">
                <div>
                    <label
                        htmlFor="project-search"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Search
                    </label>

                    <input
                        id="project-search"
                        type="search"
                        value={filters.search}
                        onChange={(event) =>
                            onChange({
                                ...filters,
                                search: event.target.value,
                            })
                        }
                        placeholder="Search projects..."
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                </div>

                <div>
                    <label
                        htmlFor="project-status-filter"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Status
                    </label>

                    <select
                        id="project-status-filter"
                        value={filters.status}
                        onChange={(event) =>
                            onChange({
                                ...filters,
                                status:
                                    event.target.value as ProjectStatus | '',
                            })
                        }
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    >
                        <option value="">All statuses</option>
                        <option value="PLANNING">Planning</option>
                        <option value="IN_PROGRESS">
                            In Progress
                        </option>
                        <option value="ON_HOLD">On Hold</option>
                        <option value="COMPLETED">
                            Completed
                        </option>
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="project-client-filter"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Client
                    </label>

                    <select
                        id="project-client-filter"
                        value={filters.clientId}
                        onChange={(event) =>
                            onChange({
                                ...filters,
                                clientId: event.target.value,
                            })
                        }
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    >
                        <option value="">All clients</option>

                        {clients.map((client) => (
                            <option
                                key={client.id}
                                value={client.id}
                            >
                                {client.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-end">
                    <button
                        type="button"
                        onClick={() =>
                            onChange({
                                search: '',
                                status: '',
                                clientId: '',
                            })
                        }
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

export default ProjectFilters