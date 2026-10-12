import { useEffect, useMemo, useState } from 'react'
import TaskForm, {
    type TaskFormData,
} from '../components/tasks/TaskForm'
import TaskFilters, {
    type TaskFiltersState,
} from '../components/tasks/TaskFilters'
import type { Task } from '../interfaces/Task'
import {
    createTask,
    deleteTask,
    getAllTasks,
    updateTask,
} from '../services/taskService'
import { getAllProjects } from '../services/projectService'
import { getAllUsers } from '../services/userService'
import { isTaskOverdue } from '../utils/taskUtils'

function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoadingTasks, setIsLoadingTasks] = useState(true)
    const [tasksError, setTasksError] = useState<string | null>(null)

    const [projects, setProjects] = useState<
        { id: string; name: string; dueDate: string; status?: string }[]
    >([])
    const [isLoadingProjects, setIsLoadingProjects] = useState(true)
    const [projectsError, setProjectsError] = useState<string | null>(null)

    const [users, setUsers] = useState<
        { id: string; name: string; email: string; role: string; workspaceId: string }[]
    >([])
    const [isLoadingUsers, setIsLoadingUsers] = useState(true)
    const [usersError, setUsersError] = useState<string | null>(null)

    const [filters, setFilters] = useState<TaskFiltersState>({
        search: '',
        status: '',
        priority: '',
        projectId: '',
        assigneeId: '',
        overdue: false,
    })

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true

        const loadProjects = async () => {
            try {
                setProjectsError(null)
                const result = await getAllProjects()

                if (isMounted) {
                    setProjects(result)
                }
            } catch (error: unknown) {
                if (isMounted) {
                    setProjectsError(
                        error instanceof Error
                            ? error.message
                            : 'Could not load projects.',
                    )
                }
            } finally {
                if (isMounted) {
                    setIsLoadingProjects(false)
                }
            }
        }

        void loadProjects()

        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        let isMounted = true

        const loadTasks = async () => {
            try {
                setTasksError(null)
                const result = await getAllTasks()

                if (isMounted) {
                    setTasks(result)
                }
            } catch (error: unknown) {
                if (isMounted) {
                    setTasksError(
                        error instanceof Error
                            ? error.message
                            : 'Could not load tasks.',
                    )
                }
            } finally {
                if (isMounted) {
                    setIsLoadingTasks(false)
                }
            }
        }

        void loadTasks()

        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        let isMounted = true

        const loadUsers = async () => {
            try {
                setUsersError(null)
                const result = await getAllUsers()

                if (isMounted) {
                    setUsers(result)
                }
            } catch (error: unknown) {
                if (isMounted) {
                    setUsersError(
                        error instanceof Error
                            ? error.message
                            : 'Could not load team members.',
                    )
                }
            } finally {
                if (isMounted) {
                    setIsLoadingUsers(false)
                }
            }
        }

        void loadUsers()

        return () => {
            isMounted = false
        }
    }, [])

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch =
                task.title
                    .toLowerCase()
                    .includes(filters.search.toLowerCase()) ||
                task.description
                    .toLowerCase()
                    .includes(filters.search.toLowerCase())

            const matchesStatus = !filters.status || task.status === filters.status

            const matchesPriority = !filters.priority || task.priority === filters.priority

            const matchesProject = !filters.projectId || task.projectId === filters.projectId

            const matchesAssignee = !filters.assigneeId || task.assigneeId === filters.assigneeId

            const matchesOverdue = !filters.overdue || isTaskOverdue(task)

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority &&
                matchesProject &&
                matchesAssignee &&
                matchesOverdue
            )
        })
    }, [tasks, filters])

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
            status: '',
            priority: '',
            projectId: '',
            assigneeId: '',
            overdue: false,
        })
    }

    const handleOpenCreateForm = () => {
        setEditingTask(null)
        setErrorMessage(null)
        setIsFormOpen(true)
    }

    const handleOpenEditForm = (task: Task) => {
        setEditingTask(task)
        setErrorMessage(null)
        setIsFormOpen(true)
    }

    const handleSubmitTask = async (formData: TaskFormData) => {
        setIsSubmitting(true)
        setErrorMessage(null)

        try {
            if (editingTask) {
                const updatedTask = await updateTask(
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
                return
            }

            const newTask = await createTask(formData)

            setTasks((current) => [...current, newTask])
            setIsFormOpen(false)
        } catch (error: unknown) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred.',
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteTask = async (taskId: string) => {
        const task = tasks.find((item) => item.id === taskId)

        if (!task) return

        const confirmed = window.confirm(
            `Are you sure you want to delete "${task.title}" ? `,
        )

        if (!confirmed) return

        setDeletingTaskId(taskId)
        setErrorMessage(null)

        try {
            await deleteTask(taskId)

            setTasks((current) =>
                current.filter((item) => item.id !== taskId),
            )
        } catch (error: unknown) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred.',
            )
        } finally {
            setDeletingTaskId(null)
        }
    }

    const getProjectName = (projectId: string) => {
        return (
            projects.find((project) => project.id === projectId)?.name ??
            'Unknown project'
        )
    }

    const getAssigneeName = (assigneeId: string) => {
        return (
            users.find((user) => user.id === assigneeId)?.name ??
            'Unknown member'
        )
    }

    const getStatusLabel = (status: Task['status']) => {
        switch (status) {
            case 'TODO':
                return 'To do'
            case 'IN_PROGRESS':
                return 'In progress'
            case 'COMPLETED':
                return 'Completed'
        }
    }

    const getPriorityLabel = (priority: Task['priority']) => {
        switch (priority) {
            case 'LOW':
                return 'Low'
            case 'MEDIUM':
                return 'Medium'
            case 'HIGH':
                return 'High'
        }
    }

    const getStatusClass = (status: Task['status']) => {
        switch (status) {
            case 'TODO':
                return 'bg-sage-mist text-forest'
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-700'
            case 'COMPLETED':
                return 'bg-green-100 text-green-700'
        }
    }

    const getPriorityClass = (priority: Task['priority']) => {
        switch (priority) {
            case 'LOW':
                return 'bg-sage-mist text-forest'
            case 'MEDIUM':
                return 'bg-amber-100 text-amber-700'
            case 'HIGH':
                return 'bg-red-100 text-red-700'
        }
    }

    const isPageLoading =
        isLoadingTasks || isLoadingProjects || isLoadingUsers

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-forest">
                        Tasks
                    </h1>
                    <p className="mt-1 text-sm text-sage">
                        Manage and track your team's tasks.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleOpenCreateForm}
                    disabled={
                        isLoadingProjects ||
                        isLoadingUsers ||
                        projects.length === 0 ||
                        users.length === 0
                    }
                    className="rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-[#10352c] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isLoadingProjects || isLoadingUsers
                        ? 'Loading form data...'
                        : 'Add Task'}
                </button>
            </div>

            {errorMessage && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {errorMessage}
                </div>
            )}

            {tasksError && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    Could not load tasks: {tasksError}
                </div>
            )}

            {projectsError && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    Could not load projects: {projectsError}
                </div>
            )}

            {usersError && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    Could not load team members: {usersError}
                </div>
            )}

            {projects.length === 0 &&
                !isLoadingProjects &&
                !projectsError && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Create a project before adding tasks.
                    </div>
                )}

            {users.length === 0 &&
                !isLoadingUsers &&
                !usersError && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        No workspace members are available to assign tasks to.
                    </div>
                )}

            {isFormOpen && (
                <section className="rounded-xl border border-sage-mist bg-white p-5 shadow-sm">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-forest">
                            {editingTask ? 'Edit Task' : 'Create Task'}
                        </h2>
                        <p className="mt-1 text-sm text-sage">
                            Enter the task details below.
                        </p>
                    </div>

                    <TaskForm
                        projects={projects}
                        users={users}
                        initialData={
                            editingTask
                                ? {
                                      projectId: editingTask.projectId,
                                      title: editingTask.title,
                                      description: editingTask.description,
                                      status: editingTask.status,
                                      priority: editingTask.priority,
                                      assigneeId: editingTask.assigneeId,
                                      dueDate: editingTask.dueDate,
                                  }
                                : undefined
                        }
                        submitLabel={
                            editingTask ? 'Update Task' : 'Create Task'
                        }
                        isSubmitting={isSubmitting}
                        onSubmit={handleSubmitTask}
                        onCancel={() => {
                            if (isSubmitting) return
                            setIsFormOpen(false)
                            setEditingTask(null)
                            setErrorMessage(null)
                        }}
                    />
                </section>
            )}

            <TaskFilters
                filters={filters}
                projects={projects}
                users={users}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
            />

            {isPageLoading ? (
                <div className="rounded-xl border border-sage-mist bg-white p-8 text-center text-sm text-sage">
                    Loading tasks and related data...
                </div>
            ) : (
                <>
                    <div className="overflow-hidden rounded-xl border border-sage-mist bg-white">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-sage-mist">
                                <thead className="bg-ivory">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-sage">
                                            Task
                                        </th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-sage">
                                            Project
                                        </th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-sage">
                                            Assignee
                                        </th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-sage">
                                            Status
                                        </th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-sage">
                                            Priority
                                        </th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-sage">
                                            Due date
                                        </th>
                                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-sage">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-sage-mist">
                                    {filteredTasks.map((task) => (
                                        <tr key={task.id}>
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-forest">
                                                    {task.title}
                                                </div>
                                                <div className="mt-1 max-w-xs truncate text-sm text-sage">
                                                    {task.description || '—'}
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-forest">
                                                {getProjectName(task.projectId)}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-forest">
                                                {getAssigneeName(task.assigneeId)}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4">
                                                <span
                                                    className={`rounded - full px - 2.5 py - 1 text - xs font - medium ${ getStatusClass(task.status) } `}
                                                >
                                                    {getStatusLabel(task.status)}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4">
                                                <span
                                                    className={`rounded - full px - 2.5 py - 1 text - xs font - medium ${ getPriorityClass(task.priority) } `}
                                                >
                                                    {getPriorityLabel(task.priority)}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-forest">
                                                <span
                                                    className={
                                                        isTaskOverdue(task)
                                                            ? 'font-medium text-red-600'
                                                            : ''
                                                    }
                                                >
                                                    {task.dueDate}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-right text-sm">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleOpenEditForm(task)
                                                    }
                                                    disabled={
                                                        isSubmitting ||
                                                        deletingTaskId !== null
                                                    }
                                                    className="mr-3 font-medium text-sage hover:text-forest disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void handleDeleteTask(task.id)
                                                    }
                                                    disabled={
                                                        deletingTaskId !== null ||
                                                        isSubmitting
                                                    }
                                                    className="font-medium text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {deletingTaskId === task.id
                                                        ? 'Deleting...'
                                                        : 'Delete'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredTasks.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-5 py-10 text-center text-sm text-sage"
                                            >
                                                {tasks.length === 0
                                                    ? 'No tasks have been created yet.'
                                                    : 'No tasks match the selected filters.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="text-sm text-sage">
                        Showing {filteredTasks.length} of {tasks.length} tasks
                    </div>
                </>
            )}
        </div>
    )
}

export default TasksPage