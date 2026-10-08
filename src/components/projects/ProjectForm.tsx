import { useState } from 'react'
import type { ProjectStatus } from '../../interfaces/Project'

interface ProjectFormData {
  clientId: string
  name: string
  description: string
  status: ProjectStatus
  startDate: string
  dueDate: string
}

interface ProjectFormProps {
  clients: {
    id: string
    name: string
  }[]
  initialData?: ProjectFormData
  submitLabel?: string
  onSubmit: (data: ProjectFormData) => void
  onCancel: () => void
}

function ProjectForm({
  clients,
  initialData,
  submitLabel = 'Add Project',
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const [formData, setFormData] =
    useState<ProjectFormData>(
      initialData ?? {
        clientId: '',
        name: '',
        description: '',
        status: 'PLANNING',
        startDate: '',
        dueDate: '',
      },
    )

  const [validationError, setValidationError] =
    useState<string | null>(null)

  const handleChange = (
    field: keyof ProjectFormData,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))

    setValidationError(null)
  }

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!formData.clientId) {
      setValidationError('Please select a client.')
      return
    }

    if (!formData.startDate) {
      setValidationError('Please select a start date.')
      return
    }

    if (!formData.dueDate) {
      setValidationError('Please select a due date.')
      return
    }

    if (formData.dueDate < formData.startDate) {
      setValidationError(
        'Due date cannot be earlier than the start date.',
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
            htmlFor="clientId"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Client
          </label>

          <select
            id="clientId"
            value={formData.clientId}
            onChange={(event) =>
              handleChange('clientId', event.target.value)
            }
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-900"
            required
          >
            <option value="">Select a client</option>

            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Project Name
          </label>

          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(event) =>
              handleChange('name', event.target.value)
            }
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-900"
            placeholder="Enter project name"
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
            placeholder="Describe the project"
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
                event.target.value as ProjectStatus,
              )
            }
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-900"
          >
            <option value="PLANNING">Planning</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div />

        <div>
          <label
            htmlFor="startDate"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Start Date
          </label>

          <input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(event) =>
              handleChange(
                'startDate',
                event.target.value,
              )
            }
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-900"
            required
          />
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

export default ProjectForm