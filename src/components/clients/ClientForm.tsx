import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ClientStatus } from '../../interfaces/Client'

interface ClientFormData {
    name: string
    email: string
    phone: string
    industry: string
    status: ClientStatus
    notes: string
}

interface ClientFormProps {
    initialData?: ClientFormData
    submitLabel?: string
    onSubmit: (data: ClientFormData) => void
    onCancel: () => void
}

interface FormErrors {
    name?: string
    email?: string
    industry?: string
}

function ClientForm({
    initialData,
    submitLabel = 'Add Client',
    onSubmit,
    onCancel,
}: ClientFormProps) {
    const [formData, setFormData] = useState<ClientFormData>(
        initialData ?? {
            name: '',
            email: '',
            phone: '',
            industry: '',
            status: 'ACTIVE',
            notes: '',
        },
    )

    const [errors, setErrors] = useState<FormErrors>({})

    const handleChange = (
        field: keyof ClientFormData,
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

    const validateForm = (): FormErrors => {
        const validationErrors: FormErrors = {}

        if (!formData.name.trim()) {
            validationErrors.name = 'Client name is required.'
        }

        if (!formData.email.trim()) {
            validationErrors.email = 'Email is required.'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            validationErrors.email = 'Enter a valid email address.'
        }

        if (!formData.industry.trim()) {
            validationErrors.industry = 'Industry is required.'
        }

        return validationErrors
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const validationErrors = validateForm()

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        onSubmit({
            ...formData,
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            industry: formData.industry.trim(),
            notes: formData.notes.trim(),
        })
    }

    const getInputClassName = (hasError = false) =>
        `w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
            hasError
                ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100'
                : 'focus:border-primary-500 focus:ring-primary-100'
        }`

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-xl border bg-white p-6"
        >
            <div className="grid gap-5 md:grid-cols-2">
                <div>
                    <label
                        htmlFor="name"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Client Name
                    </label>

                    <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(event) =>
                            handleChange('name', event.target.value)
                        }
                        className={getInputClassName(Boolean(errors.name))}
                        placeholder="Enter client name"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={
                            errors.name ? 'name-error' : undefined
                        }
                        required
                    />

                    {errors.name && (
                        <p
                            id="name-error"
                            className="mt-1.5 text-sm text-danger-600"
                        >
                            {errors.name}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="email"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Email
                    </label>

                    <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(event) =>
                            handleChange('email', event.target.value)
                        }
                        className={getInputClassName(Boolean(errors.email))}
                        placeholder="client@example.com"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={
                            errors.email ? 'email-error' : undefined
                        }
                        required
                    />

                    {errors.email && (
                        <p
                            id="email-error"
                            className="mt-1.5 text-sm text-danger-600"
                        >
                            {errors.email}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="phone"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Phone
                    </label>

                    <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(event) =>
                            handleChange('phone', event.target.value)
                        }
                        className={getInputClassName()}
                        placeholder="+90 ..."
                    />
                </div>

                <div>
                    <label
                        htmlFor="industry"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Industry
                    </label>

                    <input
                        id="industry"
                        type="text"
                        value={formData.industry}
                        onChange={(event) =>
                            handleChange('industry', event.target.value)
                        }
                        className={getInputClassName(Boolean(errors.industry))}
                        placeholder="e.g. Technology"
                        aria-invalid={Boolean(errors.industry)}
                        aria-describedby={
                            errors.industry
                                ? 'industry-error'
                                : undefined
                        }
                        required
                    />

                    {errors.industry && (
                        <p
                            id="industry-error"
                            className="mt-1.5 text-sm text-danger-600"
                        >
                            {errors.industry}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="status"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Status
                    </label>

                    <select
                        id="status"
                        value={formData.status}
                        onChange={(event) =>
                            handleChange(
                                'status',
                                event.target.value as ClientStatus,
                            )
                        }
                        className={getInputClassName()}
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label
                        htmlFor="notes"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Notes
                    </label>

                    <textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(event) =>
                            handleChange('notes', event.target.value)
                        }
                        className={`${getInputClassName()} min-h-24`}
                        placeholder="Optional notes"
                    />
                </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    )
}

export default ClientForm