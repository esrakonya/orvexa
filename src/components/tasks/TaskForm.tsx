import { useState } from 'react'
import type { TaskPriority, TaskStatus } from '../../interfaces/Task'

interface TaskFormData {
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
  }[]
  users: {
    id: string
    name: string
  }[]
  initialData?: TaskFormData
  submitLabel?: string
  onSubmit: (data: TaskFormData) => void
  onCancel: () => void
}

function TaskForm({
  projects,
  users,
  initialData,
  submitLabel = 'Add Task',
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [formData, setFormData] =
    useState<TaskFormData>(
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

  const [validationError, setValidationError] =
    useState<string | null>(null)

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

  const handleProjectChange = (
    projectId: string,
  ) => {
    const project = projects.find(
      (item) => item.id === projectId,
    )

    setFormData((current) => ({
      ...current,
      projectId,
      dueDate:
        project &&
        current.dueDate &&
        current.dueDate > project.dueDate
          ? project.dueDate
          : current.dueDate,
    }))

    setValidationError(null)
  }

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!formData.projectId) {
      setValidationError('Please select a project.')
      return
    }

    if (!formData.title.trim()) {
      setValidationError('Please enter a task title.')
      return
    }

    if (!formData.assigneeId) {
      setValidationError('Please select an assignee.')
      return
    }

    if (!formData.dueDate) {
      setValidationError('Please select a due date.')
      return
    }

    if (
      selectedProject &&
      formData.dueDate > selectedProject.dueDate
    ) {
      setValidationError(
        'Due date cannot be later than the project due date.',
      )
      return
    }

    setValidationError(null)
    onSubmit(formData)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border bg-white p-6"
    >
      {validationError && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {validationError}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="projectId"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Project
          </label>

          <select
            id="projectId"
            value={formData.projectId}
            onChange={(event) =>
              handleProjectChange(event.target.value)
            }
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-900"
            required
          >
            <option value="">Select a project</option>

            {projects.map((project) => (
              <option
                key={project.id}
                value={project.id}
              >
                {project.name}
              </option>
            ))}
          </select>

          {selectedProject && (
            <p className="mt-1 text-xs text-gray-500">
              Project due date: {selectedProject.dueDate}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="assigneeId"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Assignee
          </label>

          <select
            id="assigneeId"
            value={formData.assigneeId}
            onChange={(event) =>
              handleChange(
                'assigneeId',
                event.target.value,
              )
            }
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-900"
            required
          >
            <option value="">Select an assignee</option>

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

        <div className="md:col-span-2">
          <label
            htmlFor="title"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Task Title
          </label>

          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(event) =>
              handleChange('title', event.target.value)
            }
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-900"
            placeholder="Enter task title"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Description
          </label>

          <textarea
            id="description"
            value={formData.description}
            onChange={(event) =>
              handleChange(
                'description',
                event.target.value,
              )
            }
            className="min-h-24 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-900"
            placeholder="Describe the task"
          />
        </div>

        <div>
          <label
            htmlFor="status"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Status
          </label>

          <select
            id="status"
            value={formData.status}
            onChange={(event) =>
              handleChange(
                'status',
                event.target.value as TaskStatus,
              )
            }
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-900"
          >
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
            htmlFor="priority"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Priority
          </label>

          <select
            id="priority"
            value={formData.priority}
            onChange={(event) =>
              handleChange(
                'priority',
                event.target.value as TaskPriority,
              )
            }
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-900"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="dueDate"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Due Date
          </label>

          <input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            max={selectedProject?.dueDate}
            onChange={(event) =>
              handleChange(
                'dueDate',
                event.target.value,
              )
            }
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-900"
            required
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export default TaskForm