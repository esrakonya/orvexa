import { useEffect, useState } from 'react'
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

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : 'An unexpected error occurred.'
}

function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deletingClientId, setDeletingClientId] = useState<string | null>(
        null,
    )

    const [filters, setFilters] = useState<ClientFiltersState>({
        search: '',
        status: '',
        industry: '',
    })

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true

        async function loadClients() {
            setIsLoading(true)
            setLoadError(null)

            try {
                const result = await getAllClients()

                if (isMounted) {
                    setClients(result)
                }
            } catch (error) {
                if (isMounted) {
                    setLoadError(getErrorMessage(error))
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        void loadClients()

        return () => {
            isMounted = false
        }
    }, [])

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

        return matchesSearch && matchesStatus && matchesIndustry
    })

    const hasActiveFilters =
        filters.search.trim() !== '' ||
        filters.status !== '' ||
        filters.industry !== ''

    const handleSubmitClient = async (formData: ClientFormData) => {
        if (isSubmitting) {
            return
        }

        setIsSubmitting(true)
        setErrorMessage(null)

        try {
            if (editingClient) {
                const updatedClient = await updateClient(
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
            } else {
                const newClient = await createClient(formData)

                setClients((current) => [...current, newClient])
            }

            setEditingClient(null)
            setIsFormOpen(false)
        } catch (error) {
            setErrorMessage(getErrorMessage(error))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteClient = async (clientId: string) => {
        if (deletingClientId !== null || isSubmitting) {
            return
        }

        const client = clients.find((item) => item.id === clientId)

        if (!client) {
            return
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${client.name}" ? `,
        )

        if (!confirmed) {
            return
        }

        setDeletingClientId(clientId)
        setErrorMessage(null)

        try {
            await deleteClient(clientId)

            setClients((current) =>
                current.filter((item) => item.id !== clientId),
            )
        } catch (error) {
            setErrorMessage(getErrorMessage(error))
        } finally {
            setDeletingClientId(null)
        }
    }

    const handleAddClient = () => {
        setEditingClient(null)
        setErrorMessage(null)
        setIsFormOpen(true)
    }

    const handleCancelForm = () => {
        if (isSubmitting) {
            return
        }

        setIsFormOpen(false)
        setEditingClient(null)
        setErrorMessage(null)
    }

    const handleRetryLoad = () => {
        window.location.reload()
    }

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-forest">
                        Clients
                    </h1>

                    <p className="mt-1 text-sm text-sage">
                        Manage your organization's clients.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleAddClient}
                    disabled={
                        isSubmitting ||
                        isLoading ||
                        loadError !== null ||
                        deletingClientId !== null
                    }
                    className="w-full rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white transition hover:bg-[#10352c] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
                    isSubmitting={isSubmitting}
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
                {isLoading ? (
                    <div
                        role="status"
                        className="px-6 py-12 text-center text-sm text-sage"
                    >
                        Loading clients...
                    </div>
                ) : loadError ? (
                    <div
                        role="alert"
                        className="px-6 py-12 text-center text-sm text-danger-700"
                    >
                        <p>Could not load clients.</p>
                        <p className="mt-2">{loadError}</p>

                        <button
                            type="button"
                            onClick={handleRetryLoad}
                            className="mt-4 rounded-lg border px-4 py-2 font-medium text-forest transition hover:bg-ivory"
                        >
                            Retry
                        </button>
                    </div>
                ) : filteredClients.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <h2 className="text-lg font-semibold text-forest">
                            {clients.length === 0
                                ? 'No clients yet'
                                : 'No clients match your filters'}
                        </h2>

                        <p className="mt-2 text-sm text-sage">
                            {clients.length === 0
                                ? 'Add your first client to start managing your client relationships.'
                                : 'Try adjusting your search or filters.'}
                        </p>

                        {clients.length === 0 ? (
                            <button
                                type="button"
                                onClick={handleAddClient}
                                className="mt-4 rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white transition hover:bg-[#10352c]"
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
                                className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium text-forest transition hover:bg-ivory"
                            >
                                Clear Filters
                            </button>
                        ) : null}
                    </div>
                ) : (
                    <div className="min-w-[760px]">
                        <div className="grid grid-cols-[1.2fr_1fr_0.8fr_2fr_140px] border-b bg-ivory px-6 py-3 text-sm font-medium text-sage">
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
                                <span className="min-w-0 truncate font-medium text-forest">
                                    {client.name}
                                </span>

                                <span className="text-sage">
                                    {client.industry}
                                </span>

                                <span>
                                    <span
                                        className={
                                            client.status === 'ACTIVE'
                                                ? 'inline-flex rounded-full bg-success-50 px-2.5 py-1 text-xs font-medium text-success-700'
                                                : 'inline-flex rounded-full bg-sage-mist px-2.5 py-1 text-xs font-medium text-sage'
                                        }
                                    >
                                        {statusLabels[client.status]}
                                    </span>
                                </span>

                                <span className="min-w-0 truncate text-sage">
                                    {client.email}
                                </span>

                                <div className="flex min-w-[140px] justify-end gap-3">
                                    <button
                                        type="button"
                                        disabled={
                                            deletingClientId !== null ||
                                            isSubmitting
                                        }
                                        onClick={() => {
                                            setEditingClient(client)
                                            setErrorMessage(null)
                                            setIsFormOpen(true)
                                        }}
                                        className="text-sm font-medium text-sage transition hover:text-forest disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            deletingClientId !== null ||
                                            isSubmitting
                                        }
                                        onClick={() => {
                                            void handleDeleteClient(client.id)
                                        }}
                                        className="text-sm font-medium text-danger-600 transition hover:text-danger-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {deletingClientId === client.id
                                            ? 'Deleting...'
                                            : 'Delete'}
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