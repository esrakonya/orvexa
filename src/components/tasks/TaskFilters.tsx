import type { TaskPriority, TaskStatus } from '../../interfaces/Task'

export interface TaskFiltersState {
    search: string
    projectId: string
    assigneeId: string
    status: TaskStatus | ''
    priority: TaskPriority | ''
    overdue: boolean
}

interface TaskFiltersProps {
    filters: TaskFiltersState
    projects: {
        id: string
        name: string
    }[]
    users: {
        id: string
        name: string
    }[]
    onChange: (
        field: keyof TaskFiltersState,
        value: string | boolean,
    ) => void
    onClear: () => void
}

function TaskFilters({
    filters,
    projects,
    users,
    onChange,
    onClear,
}: TaskFiltersProps) {
    const hasActiveFilters =
        filters.search.trim() !== '' ||
        filters.projectId !== '' ||
        filters.assigneeId !== '' ||
        filters.status !== '' ||
        filters.priority !== '' ||
        filters.overdue

    const fieldClassName =
        'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100'

    return (
        <div className="mt-6 rounded-xl border bg-white p-4 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <div className="xl:col-span-2">
                    <label
                        htmlFor="task-search"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Search
                    </label>

                    <input
                        id="task-search"
                        type="search"
                        value={filters.search}
                        onChange={(event) =>
                            onChange('search', event.target.value)
                        }
                        placeholder="Search tasks..."
                        className={fieldClassName}
                    />
                </div>

                <div>
                    <label
                        htmlFor="task-project-filter"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Project
                    </label>

                    <select
                        id="task-project-filter"
                        value={filters.projectId}
                        onChange={(event) =>
                            onChange('projectId', event.target.value)
                        }
                        className={fieldClassName}
                    >
                        <option value="">All Projects</option>

                        {projects.map((project) => (
                            <option
                                key={project.id}
                                value={project.id}
                            >
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="task-assignee-filter"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Assignee
                    </label>

                    <select
                        id="task-assignee-filter"
                        value={filters.assigneeId}
                        onChange={(event) =>
                            onChange(
                                'assigneeId',
                                event.target.value,
                            )
                        }
                        className={fieldClassName}
                    >
                        <option value="">All Assignees</option>

                        {users.map((user) => (
                            <option
                                key={user.id}
                                value={user.id}
                            >
                                {user.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="task-status-filter"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Status
                    </label>

                    <select
                        id="task-status-filter"
                        value={filters.status}
                        onChange={(event) =>
                            onChange('status', event.target.value)
                        }
                        className={fieldClassName}
                    >
                        <option value="">All Statuses</option>
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">
                            In Progress
                        </option>
                        <option value="COMPLETED">
                            Completed
                        </option>
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="task-priority-filter"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Priority
                    </label>

                    <select
                        id="task-priority-filter"
                        value={filters.priority}
                        onChange={(event) =>
                            onChange(
                                'priority',
                                event.target.value,
                            )
                        }
                        className={fieldClassName}
                    >
                        <option value="">All Priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                    <input
                        type="checkbox"
                        checked={filters.overdue}
                        onChange={(event) =>
                            onChange('overdue', event.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300 accent-primary-600 focus:ring-2 focus:ring-primary-100"
                    />

                    Show overdue tasks only
                </label>

                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="rounded-md px-2 py-1 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    >
                        Clear filters
                    </button>
                )}
            </div>
        </div>
    )
}

export default TaskFilters