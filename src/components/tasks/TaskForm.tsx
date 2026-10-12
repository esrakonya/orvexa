import { useState } from 'react'
import type { TaskPriority, TaskStatus } from '../../interfaces/Task'

export interface TaskFormData {
    projectId: string
    title: string
    description: string
    status: TaskStatus
    priority: TaskPriority
    assigneeId: string
    dueDate: string
}

interface TaskFormProps {
    projects: {
        id: string
        name: string
        dueDate: string
        status?: string
    }[]
    users: {
        id: string
        name: string
    }[]
    initialData?: TaskFormData
    submitLabel?: string
    isSubmitting?: boolean
    onSubmit: (data: TaskFormData) => void | Promise<void>
    onCancel: () => void
}

function TaskForm({
    projects,
    users,
    initialData,
    submitLabel = 'Save Task',
    isSubmitting = false,
    onSubmit,
    onCancel,
}: TaskFormProps) {
    const [formData, setFormData] = useState<TaskFormData>(
        initialData ?? {
            projectId: '',
            title: '',
            description: '',
            status: 'TODO',
            priority: 'MEDIUM',
            assigneeId: '',
            dueDate: '',
        },
    )

    const [validationError, setValidationError] = useState<string | null>(
        null,
    )

    const selectedProject = projects.find(
        (project) => project.id === formData.projectId,
    )

    const handleChange = (
        field: keyof TaskFormData,
        value: string,
    ) => {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }))

        setValidationError(null)
    }

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()

        if (isSubmitting) return

        if (!formData.projectId) {
            setValidationError('Please select a project.')
            return
        }

        if (!formData.title.trim()) {
            setValidationError('Task title is required.')
            return
        }

        if (formData.title.trim().length > 200) {
            setValidationError(
                'Task title must not exceed 200 characters.',
            )
            return
        }

        if (!formData.assigneeId) {
            setValidationError('Please assign the task to a team member.')
            return
        }

        if (!formData.dueDate) {
            setValidationError('Due date is required.')
            return
        }

        if (
            selectedProject?.dueDate &&
            formData.dueDate > selectedProject.dueDate
        ) {
            setValidationError(
                'Task due date cannot be later than the project due date.',
            )
            return
        }

        if (selectedProject?.status === 'COMPLETED') {
            setValidationError(
                'You cannot create or move a task to a completed project.',
            )
            return
        }

        setValidationError(null)

        await onSubmit({
            ...formData,
            title: formData.title.trim(),
            description: formData.description.trim(),
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {validationError && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {validationError}
                </div>
            )}

            <div>
                <label
                    htmlFor="task-title"
                    className="mb-1 block text-sm font-medium"
                >
                    Task title
                </label>

                <input
                    id="task-title"
                    type="text"
                    value={formData.title}
                    onChange={(event) =>
                        handleChange('title', event.target.value)
                    }
                    maxLength={200}
                    required
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-sage-mist px-3 py-2 outline-none focus:border-sage disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="Enter task title"
                />
            </div>

            <div>
                <label
                    htmlFor="task-description"
                    className="mb-1 block text-sm font-medium"
                >
                    Description
                </label>

                <textarea
                    id="task-description"
                    value={formData.description}
                    onChange={(event) =>
                        handleChange('description', event.target.value)
                    }
                    rows={3}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-sage-mist px-3 py-2 outline-none focus:border-sage disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="Describe the task"
                />
            </div>

            <div>
                <label
                    htmlFor="task-project"
                    className="mb-1 block text-sm font-medium"
                >
                    Project
                </label>

                <select
                    id="task-project"
                    value={formData.projectId}
                    onChange={(event) =>
                        handleChange('projectId', event.target.value)
                    }
                    required
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-sage-mist px-3 py-2 outline-none focus:border-sage disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <option value="">Select a project</option>

                    {projects
                        .filter(
                            (project) => project.status !== 'COMPLETED',
                        )
                        .map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                </select>
            </div>

            <div>
                <label
                    htmlFor="task-assignee"
                    className="mb-1 block text-sm font-medium"
                >
                    Assignee
                </label>

                <select
                    id="task-assignee"
                    value={formData.assigneeId}
                    onChange={(event) =>
                        handleChange('assigneeId', event.target.value)
                    }
                    required
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-sage-mist px-3 py-2 outline-none focus:border-sage disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <option value="">Select a team member</option>

                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                    <label
                        htmlFor="task-status"
                        className="mb-1 block text-sm font-medium"
                    >
                        Status
                    </label>

                    <select
                        id="task-status"
                        value={formData.status}
                        onChange={(event) =>
                            handleChange('status', event.target.value)
                        }
                        required
                        disabled={isSubmitting}
                        className="w-full rounded-lg border border-sage-mist px-3 py-2 outline-none focus:border-sage disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <option value="TODO">To do</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="task-priority"
                        className="mb-1 block text-sm font-medium"
                    >
                        Priority
                    </label>

                    <select
                        id="task-priority"
                        value={formData.priority}
                        onChange={(event) =>
                            handleChange('priority', event.target.value)
                        }
                        required
                        disabled={isSubmitting}
                        className="w-full rounded-lg border border-sage-mist px-3 py-2 outline-none focus:border-sage disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="task-due-date"
                        className="mb-1 block text-sm font-medium"
                    >
                        Due date
                    </label>

                    <input
                        id="task-due-date"
                        type="date"
                        value={formData.dueDate}
                        onChange={(event) =>
                            handleChange('dueDate', event.target.value)
                        }
                        max={selectedProject?.dueDate || undefined}
                        required
                        disabled={isSubmitting}
                        className="w-full rounded-lg border border-sage-mist px-3 py-2 outline-none focus:border-sage disabled:cursor-not-allowed disabled:opacity-60"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-sage-mist pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="rounded-lg border border-sage-mist px-4 py-2 text-sm font-medium hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? 'Saving...' : submitLabel}
                </button>
            </div>
        </form>
    )
}

export default TaskForm