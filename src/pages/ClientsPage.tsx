import { useState } from 'react'
import ClientFilters, {
    type ClientFiltersState,
} from '../components/clients/ClientFilters'
import ClientForm from '../components/clients/ClientForm'
import type { Client, ClientStatus } from '../interfaces/Client'
import {
    createClient,
    deleteClient,
    getAllClients,
    updateClient,
} from '../services/clientService'

interface ClientFormData {
    name: string
    email: string
    phone: string
    industry: string
    status: ClientStatus
    notes: string
}

const statusLabels: Record<ClientStatus, string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
}

function ClientsPage() {
    const [clients, setClients] = useState<Client[]>(() =>
        getAllClients(),
    )
    const [filters, setFilters] = useState<ClientFiltersState>({
        search: '',
        status: '',
        industry: '',
    })
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const industries = Array.from(
        new Set(clients.map((client) => client.industry)),
    ).sort()

    const filteredClients = clients.filter((client) => {
        const searchTerm = filters.search.trim().toLowerCase()

        const matchesSearch =
            searchTerm === '' ||
            client.name.toLowerCase().includes(searchTerm) ||
            client.email.toLowerCase().includes(searchTerm)

        const matchesStatus =
            filters.status === '' ||
            client.status === filters.status

        const matchesIndustry =
            filters.industry === '' ||
            client.industry === filters.industry

        return (
            matchesSearch &&
            matchesStatus &&
            matchesIndustry
        )
    })

    const hasActiveFilters =
        filters.search.trim() !== '' ||
        filters.status !== '' ||
        filters.industry !== ''

    const handleSubmitClient = (formData: ClientFormData) => {
        try {
            if (editingClient) {
                const updatedClient = updateClient(
                    editingClient.id,
                    formData,
                )

                setClients((current) =>
                    current.map((client) =>
                        client.id === updatedClient.id
                            ? updatedClient
                            : client,
                    ),
                )

                setEditingClient(null)
                setIsFormOpen(false)
                setErrorMessage(null)

                return
            }

            const newClient = createClient({
                ...formData,
                workspaceId: 'workspace-1',
            })

            setClients((current) => [...current, newClient])
            setIsFormOpen(false)
            setErrorMessage(null)
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message)
            } else {
                setErrorMessage('An unexpected error occurred.')
            }
        }
    }

    const handleDeleteClient = (clientId: string) => {
        const client = clients.find((item) => item.id === clientId)

        if (!client) {
            return
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${client.name}"`,
        )

        if (!confirmed) {
            return
        }

        try {
            deleteClient(clientId)

            setClients((current) =>
                current.filter((client) => client.id !== clientId),
            )

            setErrorMessage(null)
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message)
            } else {
                setErrorMessage('An unexpected error occurred.')
            }
        }
    }

    const handleAddClient = () => {
        setEditingClient(null)
        setErrorMessage(null)
        setIsFormOpen(true)
    }

    const handleCancelForm = () => {
        setIsFormOpen(false)
        setEditingClient(null)
        setErrorMessage(null)
    }

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Clients
                    </h1>

                    <p className="mt-1 text-sm text-gray-600">
                        Manage your organization's clients.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleAddClient}
                    className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 sm:w-auto"
                >
                    Add Client
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

            {isFormOpen && (
                <ClientForm
                    initialData={
                        editingClient
                            ? {
                                name: editingClient.name,
                                email: editingClient.email,
                                phone: editingClient.phone ?? '',
                                industry: editingClient.industry,
                                status: editingClient.status,
                                notes: editingClient.notes ?? '',
                            }
                            : undefined
                    }
                    submitLabel={
                        editingClient ? 'Save Changes' : 'Add Client'
                    }
                    onSubmit={handleSubmitClient}
                    onCancel={handleCancelForm}
                />
            )}

            <div className="mt-6">
                <ClientFilters
                    filters={filters}
                    industries={industries}
                    onChange={setFilters}
                />
            </div>

            <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
                {filteredClients.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {clients.length === 0
                                ? 'No clients yet'
                                : 'No clients match your filters'}
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            {clients.length === 0
                                ? 'Add your first client to start managing your client relationships.'
                                : 'Try adjusting your search or filters.'}
                        </p>

                        {clients.length === 0 ? (
                            <button
                                type="button"
                                onClick={handleAddClient}
                                className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
                            >
                                Add Client
                            </button>
                        ) : hasActiveFilters ? (
                            <button
                                type="button"
                                onClick={() =>
                                    setFilters({
                                        search: '',
                                        status: '',
                                        industry: '',
                                    })
                                }
                                className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                Clear Filters
                            </button>
                        ) : null}
                    </div>
                ) : (
                    <div className="min-w-[760px]">
                        <div className="grid grid-cols-[1.2fr_1fr_0.8fr_2fr_140px] border-b bg-gray-50 px-6 py-3 text-sm font-medium text-gray-600">
                            <span>Client</span>
                            <span>Industry</span>
                            <span>Status</span>
                            <span>Email</span>
                            <span className="text-right">Actions</span>
                        </div>

                        {filteredClients.map((client) => (
                            <div
                                key={client.id}
                                className="grid grid-cols-[1.2fr_1fr_0.8fr_2fr_140px] items-center border-b px-6 py-4 text-sm last:border-b-0"
                            >
                                <span className="min-w-0 truncate font-medium text-gray-900">
                                    {client.name}
                                </span>

                                <span className="text-gray-600">
                                    {client.industry}
                                </span>

                                <span>
                                    <span
                                        className={
                                            client.status === 'ACTIVE'
                                                ? 'inline-flex rounded-full bg-success-50 px-2.5 py-1 text-xs font-medium text-success-700'
                                                : 'inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600'
                                        }
                                    >
                                        {statusLabels[client.status]}
                                    </span>
                                </span>

                                <span className="min-w-0 truncate text-gray-600">
                                    {client.email}
                                </span>

                                <div className="flex min-w-[140px] justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingClient(client)
                                            setErrorMessage(null)
                                            setIsFormOpen(true)
                                        }}
                                        className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeleteClient(client.id)
                                        }
                                        className="text-sm font-medium text-danger-600 transition hover:text-danger-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ClientsPage