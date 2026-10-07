import React, { useState } from "react";
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
    })

    const handleChange = (
        field: keyof ClientFormData,
        value: string,
    ) => {
        setFormData((current) => ({
            ...current,
            [field]: value
        }))
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        onSubmit(formData)
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-xl border bg-white p-6"
        >
            <div className="grid gap-5 md:grid-cols-2">
                <div>
                    <label 
                        htmlFor="name"
                        className="mb-1 block text-sm font-medium text-gray-700"
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
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-900"
                        placeholder="Enter client name"
                        required
                    />
                </div>

                <div>
                    <label 
                        htmlFor="email"
                        className="mb-1 block text-sm font-medium text-gray-700"
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
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-900"
                        placeholder="client@example.com"
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="phone"
                        className="mb-1 block text-sm font-medium text-gray-700"
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
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-900"
                        placeholder="+90 ..."
                    />
                </div>

                <div>
                    <label
                    htmlFor="industry"
                    className="mb-1 block text-sm font-medium text-gray-700"
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
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-900"
                        placeholder="e.g. Technology"
                        required
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
                            event.target.value as ClientStatus,
                        )
                        }
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-900"
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label 
                        htmlFor="notes"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Notes
                    </label>

                    <textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(event) =>
                        handleChange('notes', event.target.value)
                        }
                        className="min-h-24 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-900"
                        placeholder="Optional notes"
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


export default ClientForm