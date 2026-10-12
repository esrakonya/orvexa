import { apiRequest } from '../api/apiClient'
import type { Client } from '../interfaces/Client'

export type CreateClientInput = Pick<
    Client,
    'name' | 'email' | 'industry'
> & {
    phone?: string
    notes?: string
}

export type UpdateClientInput = Partial<
    Pick<
        Client,
        'name' | 'email' | 'phone' | 'industry' | 'notes' | 'status'
    >
>

const CLIENTS_ENDPOINT = '/api/clients'

export function getAllClients(): Promise<Client[]> {
    return apiRequest<Client[]>(CLIENTS_ENDPOINT)
}

export function getClientById(
    clientId: string,
): Promise<Client> {
    return apiRequest<Client>(
        `${CLIENTS_ENDPOINT }/${clientId}`,
    )
}

export function createClient(
  client: CreateClientInput,
): Promise<Client> {
  return apiRequest<Client>(CLIENTS_ENDPOINT, {
    method: 'POST',
    body: {
      name: client.name,
      email: client.email,
      phone: client.phone,
      industry: client.industry,
      notes: client.notes,
    },
  })
}

export function updateClient(
  clientId: string,
  updates: UpdateClientInput,
): Promise<Client> {
  return apiRequest<Client>(
    `${CLIENTS_ENDPOINT}/${clientId}`,
    {
      method: 'PATCH',
      body: updates,
    },
  )
}

export function deleteClient(
  clientId: string,
): Promise<void> {
  return apiRequest<void>(
    `${CLIENTS_ENDPOINT}/${clientId}`,
    {
      method: 'DELETE',
    },
  )
}