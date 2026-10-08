import { useState } from 'react'
import TaskFilters, {
    type TaskFiltersState,
} from '../components/tasks/TaskFilters'
import TaskForm from '../components/tasks/TaskForm'
import type {
    Task,
    TaskPriority,
    TaskStatus,
} from '../interfaces/Task'
import {
    createTask,
    deleteTask,
    getAllTasks,
    updateTask,
} from '../services/taskService'
import { getAllProjects } from '../services/projectService'
import { getAllUsers } from '../services/userService'
import { isTaskOverdue } from '../utils/taskUtils'

interface TaskFormData {
    projectId: string
    title: string
    description: string
    status: TaskStatus
    priority: TaskPriority
    assigneeId: string
    dueDate: string
}

const statusLabels: Record<TaskStatus, string> = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
}

const statusStyles: Record<
    TaskStatus,
    string
> = {
    TODO: 'bg-gray-100 text-gray-700',
    IN_PROGRESS: 'bg-info-50 text-info-700',
    COMPLETED: 'bg-success-50 text-success-700',
}

const priorityLabels: Record<
    TaskPriority,
    string
> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
}

const priorityStyles: Record<
    TaskPriority,
    string
> = {
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-warning-50 text-warning-700',
    HIGH: 'bg-danger-50 text-danger-700',
}

function formatDueDate(date: string): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(`${date}T00:00:00`))
}

function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>(() =>
        getAllTasks(),
    )

    const [projects] = useState(() =>
        getAllProjects(),
    )

    const [users] = useState(() =>
        getAllUsers(),
    )

    const [filters, setFilters] =
        useState<TaskFiltersState>({
            search: '',
            projectId: '',
            assigneeId: '',
            status: '',
            priority: '',
            overdue: false,
        })

    const [isFormOpen, setIsFormOpen] =
        useState(false)

    const [editingTask, setEditingTask] =
        useState<Task | null>(null)

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null)

    const handleFilterChange = (
        field: keyof TaskFiltersState,
        value: string | boolean,
    ) => {
        setFilters((current) => ({
            ...current,
            [field]: value,
        }))
    }

    const handleClearFilters = () => {
        setFilters({
            search: '',
            projectId: '',
            assigneeId: '',
            status: '',
            priority: '',
            overdue: false,
        })
    }

    const filteredTasks = tasks.filter((task) => {
        const normalizedSearch =
            filters.search.trim().toLowerCase()

        if (
            normalizedSearch &&
            !task.title
                .toLowerCase()
                .includes(normalizedSearch)
        ) {
            return false
        }

        if (
            filters.projectId &&
            task.projectId !== filters.projectId
        ) {
            return false
        }

        if (
            filters.assigneeId &&
            task.assigneeId !== filters.assigneeId
        ) {
            return false
        }

        if (
            filters.status &&
            task.status !== filters.status
        ) {
            return false
        }

        if (
            filters.priority &&
            task.priority !== filters.priority
        ) {
            return false
        }

        if (
            filters.overdue &&
            !isTaskOverdue(task)
        ) {
            return false
        }

        return true
    })

    const handleSubmitTask = (
        formData: TaskFormData,
    ) => {
        try {
            if (editingTask) {
                const updatedTask = updateTask(
                    editingTask.id,
                    formData,
                )

                setTasks((current) =>
                    current.map((task) =>
                        task.id === updatedTask.id
                            ? updatedTask
                            : task,
                    ),
                )

                setEditingTask(null)
                setIsFormOpen(false)
                setErrorMessage(null)

                return
            }

            const newTask = createTask({
                ...formData,
                workspaceId: 'workspace-1',
            })

            setTasks((current) => [
                ...current,
                newTask,
            ])

            setIsFormOpen(false)
            setErrorMessage(null)
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message)
            } else {
                setErrorMessage(
                    'An unexpected error occurred.',
                )
            }
        }
    }

    const handleDeleteTask = (
        taskId: string,
    ) => {
        const task = tasks.find(
            (item) => item.id === taskId,
        )

        if (!task) {
            return
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${task.title}"?`,
        )

        if (!confirmed) {
            return
        }

        try {
            deleteTask(taskId)

            setTasks((current) =>
                current.filter(
                    (item) => item.id !== taskId,
                ),
            )

            setErrorMessage(null)
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message)
            } else {
                setErrorMessage(
                    'An unexpected error occurred.',
                )
            }
        }
    }

    const hasActiveFilters =
        filters.search.trim() !== '' ||
        filters.projectId !== '' ||
        filters.assigneeId !== '' ||
        filters.status !== '' ||
        filters.priority !== '' ||
        filters.overdue

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Tasks
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage and track your organization's tasks.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setEditingTask(null)
                        setErrorMessage(null)
                        setIsFormOpen(true)
                    }}
                    className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-200 sm:w-auto"
                >
                    Add Task
                </button>
            </div>

            {errorMessage && (
                <div
                    role="alert"
                    className="mt-6 rounded-lg border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-700"
                >
                    {errorMessage}
                </div>
            )}

            <TaskFilters
                filters={filters}
                projects={projects}
                users={users}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
            />

            {isFormOpen && (
                <TaskForm
                    projects={projects}
                    users={users}
                    initialData={
                        editingTask
                            ? {
                                projectId:
                                    editingTask.projectId,
                                title: editingTask.title,
                                description:
                                    editingTask.description,
                                status: editingTask.status,
                                priority:
                                    editingTask.priority,
                                assigneeId:
                                    editingTask.assigneeId,
                                dueDate:
                                    editingTask.dueDate,
                            }
                            : undefined
                    }
                    submitLabel={
                        editingTask
                            ? 'Save Changes'
                            : 'Add Task'
                    }
                    onSubmit={handleSubmitTask}
                    onCancel={() => {
                        setIsFormOpen(false)
                        setEditingTask(null)
                        setErrorMessage(null)
                    }}
                />
            )}

            {/*
        Desktop / tablet task table.
        A minimum width prevents columns from collapsing
        into each other on smaller screens.
      */}
            <div className="mt-6 hidden overflow-x-auto rounded-xl border bg-white md:block">
                <div className="min-w-[1000px]">
                    <div className="grid grid-cols-[2fr_1.4fr_1.3fr_0.9fr_1.1fr_1.2fr_140px] border-b bg-gray-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <span>Task</span>
                        <span>Project</span>
                        <span>Assignee</span>
                        <span>Priority</span>
                        <span>Status</span>
                        <span>Due Date</span>
                        <span className="text-right">
                            Actions
                        </span>
                    </div>

                    {filteredTasks.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-sm font-medium text-gray-900">
                                {hasActiveFilters
                                    ? 'No tasks match your filters'
                                    : 'No tasks yet'}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                {hasActiveFilters
                                    ? 'Try changing or clearing your filters.'
                                    : 'Create your first task to start tracking work.'}
                            </p>

                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="mt-4 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-100"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredTasks.map((task) => {
                            const project = projects.find(
                                (item) =>
                                    item.id === task.projectId,
                            )

                            const assignee = users.find(
                                (user) =>
                                    user.id === task.assigneeId,
                            )

                            const overdue = isTaskOverdue(task)

                            return (
                                <div
                                    key={task.id}
                                    className="grid grid-cols-[2fr_1.4fr_1.3fr_0.9fr_1.1fr_1.2fr_140px] items-center border-b px-6 py-4 text-sm last:border-b-0"
                                >
                                    <span className="min-w-0 truncate font-medium text-gray-900">
                                        {task.title}
                                    </span>

                                    <span className="min-w-0 truncate text-gray-600">
                                        {project?.name ??
                                            'Unknown project'}
                                    </span>

                                    <span className="min-w-0 truncate text-gray-600">
                                        {assignee?.name ??
                                            'Unknown user'}
                                    </span>

                                    <span>
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyles[task.priority]}`}
                                        >
                                            {priorityLabels[task.priority]}
                                        </span>
                                    </span>

                                    <span>
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[task.status]}`}
                                        >
                                            {statusLabels[task.status]}
                                        </span>
                                    </span>

                                    <div className="min-w-0">
                                        <span
                                            className={
                                                overdue
                                                    ? 'font-medium text-danger-600'
                                                    : 'text-gray-600'
                                            }
                                        >
                                            {formatDueDate(task.dueDate)}
                                        </span>

                                        {overdue && (
                                            <span className="ml-2 text-xs font-medium text-danger-600">
                                                Overdue
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex min-w-[140px] justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingTask(task)
                                                setErrorMessage(null)
                                                setIsFormOpen(true)
                                            }}
                                            className="rounded-md px-2 py-1 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-100"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteTask(task.id)
                                            }
                                            className="rounded-md px-2 py-1 text-sm font-medium text-danger-600 transition hover:bg-danger-50 hover:text-danger-700 focus:outline-none focus:ring-2 focus:ring-danger-100"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/*
        Mobile task cards.
        Cards are used instead of squeezing seven table
        columns into a narrow viewport.
      */}
            <div className="mt-6 space-y-3 md:hidden">
                {filteredTasks.length === 0 ? (
                    <div className="rounded-xl border bg-white px-6 py-12 text-center">
                        <p className="text-sm font-medium text-gray-900">
                            {hasActiveFilters
                                ? 'No tasks match your filters'
                                : 'No tasks yet'}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            {hasActiveFilters
                                ? 'Try changing or clearing your filters.'
                                : 'Create your first task to start tracking work.'}
                        </p>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="mt-4 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-100"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    filteredTasks.map((task) => {
                        const project = projects.find(
                            (item) =>
                                item.id === task.projectId,
                        )

                        const assignee = users.find(
                            (user) =>
                                user.id === task.assigneeId,
                        )

                        const overdue = isTaskOverdue(task)

                        return (
                            <article
                                key={task.id}
                                className="rounded-xl border bg-white p-4 shadow-sm"
                            >
                                <div className="min-w-0">
                                    <h2 className="truncate font-semibold text-gray-900">
                                        {task.title}
                                    </h2>

                                    <p className="mt-1 truncate text-sm text-gray-500">
                                        {project?.name ??
                                            'Unknown project'}
                                    </p>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyles[task.priority]}`}
                                    >
                                        {priorityLabels[task.priority]}
                                    </span>

                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[task.status]}`}
                                    >
                                        {statusLabels[task.status]}
                                    </span>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Assignee
                                        </p>

                                        <p className="mt-1 truncate text-gray-700">
                                            {assignee?.name ??
                                                'Unknown user'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Due Date
                                        </p>

                                        <p
                                            className={`mt-1 ${overdue
                                                    ? 'font-medium text-danger-600'
                                                    : 'text-gray-700'
                                                }`}
                                        >
                                            {formatDueDate(task.dueDate)}
                                        </p>

                                        {overdue && (
                                            <p className="mt-0.5 text-xs font-medium text-danger-600">
                                                Overdue
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end gap-2 border-t pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingTask(task)
                                            setErrorMessage(null)
                                            setIsFormOpen(true)
                                        }}
                                        className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-100"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeleteTask(task.id)
                                        }
                                        className="rounded-md px-3 py-1.5 text-sm font-medium text-danger-600 transition hover:bg-danger-50 hover:text-danger-700 focus:outline-none focus:ring-2 focus:ring-danger-100"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </article>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default TasksPage