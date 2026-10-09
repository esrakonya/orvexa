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

interface FormErrors {
    clientId?: string
    name?: string
    startDate?: string
    dueDate?: string
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

  const [errors, setErrors] = useState<FormErrors>({})

  const handleChange = (
    field: keyof ProjectFormData,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))

    setErrors((current) => ({
        ...current,
        [field]: undefined,
    }))
  }

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const nextErrors: FormErrors = {}

    if (!formData.clientId) {
        nextErrors.clientId = 'Please select a client.'
    }

    if (!formData.name.trim()) {
        nextErrors.name = 'Project name is required.'
    }

    if (!formData.startDate) {
        nextErrors.startDate = 'Please select a start date.'
    }

    if (!formData.dueDate) {
        nextErrors.dueDate = 'Please select a due date.'
    } else if(
        formData.startDate && formData.dueDate < formData.startDate
    ) {
        nextErrors.dueDate = 'Due date cannot be earlier than the start date.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
        return
    }

    onSubmit({
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border bg-white p-6"
    >
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
            aria-invalid={Boolean(errors.clientId)}
            aria-describedby={
                errors.clientId ? 'clientId-error' : undefined
            }
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
                errors.clientId
                    ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100'
                    : 'focus:border-primary-500 focus:ring-primary-100'
            }`}
            required
          >
            <option value="">Select a client</option>

            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          {errors.clientId && (
            <p
                id='clientId-error'
                className='mt-1 text-sm text-danger-600'
            >
                {errors.clientId}
            </p>
          )}
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
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                errors.name
                    ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100'
                    : 'focus:border-primary-500 focus:ring-primary-100'
            }`}
            placeholder="Enter project name"
            required
          />
          {errors.name && (
            <p
                id="name-error"
                className="mt-1 text-sm text-danger-600"
            >
                {errors.name}
            </p>
          )}
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
            className="min-h-24 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
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
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
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
            aria-invalid={Boolean(errors.startDate)}
            aria-describedby={
                errors.startDate ? 'startDate-error': undefined
            }
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
                errors.startDate
                    ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100'
                    : 'focus:border-primary-500 focus:ring-primary-100'
            }`}
            required
          />
          {errors.startDate && (
            <p
                id="startDate-error"
                className="mt-1 text-sm text-danger-600"
            >
                {errors.startDate}
            </p>
          )}
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
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
                errors.dueDate
                    ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100'
                    : 'focus:border-primary-500 focus:ring-primary-100'
            }`}
            required
          />
          {errors.dueDate && (
            <p
                id="dueDate-error"
                className="mt-1 text-sm text-danger-600"
            >
                {errors.dueDate}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export default ProjectForm