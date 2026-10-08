import { useState } from 'react'
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

function ClientsPage() {
    const [clients, setClients] = useState<Client[]>(() =>
        getAllClients(),
    )
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const handleSubmitClient = (formData: ClientFormData) => {
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

            return
        }

        const newClient = createClient({
            ...formData,
            workspaceId: 'workspace-1',
        })

        setClients((current) => [...current, newClient])
        setIsFormOpen(false)
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

    return (
        <div>
            <div className="flex items-center justify-between">
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
                    onClick={() => setIsFormOpen(true)}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                    Add Client
                </button>
            </div>

            {errorMessage && (
                <div
                    role="alert"
                    className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
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
                    onCancel={() => {
                        setIsFormOpen(false)
                        setEditingClient(null)
                    }}
                />
            )}

            <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
                <div className="min-w-[760px]">
                    <div className="grid grid-cols-[1.2fr_1fr_0.8fr_2fr_140px] border-b bg-gray-50 px-6 py-3 text-sm font-medium text-gray-600">
                        <span>Client</span>
                        <span>Industry</span>
                        <span>Status</span>
                        <span>Email</span>
                        <span className="text-right">Actions</span>
                    </div>

                    {clients.map((client) => (
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

                            <span
                                className={
                                    client.status === 'ACTIVE'
                                        ? 'font-medium text-success-600'
                                        : 'font-medium text-gray-500'
                                }
                            >
                                {client.status}
                            </span>

                            <span className="min-w-0 truncate text-gray-600">
                                {client.email}
                            </span>

                            <div className="flex min-w-[140px] justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingClient(client)
                                        setIsFormOpen(true)
                                    }}
                                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDeleteClient(client.id)}
                                    className="text-sm font-medium text-danger-600 hover:text-danger-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ClientsPage