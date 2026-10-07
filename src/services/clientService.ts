import type { Client } from "../interfaces/Client";
import { getData, saveData } from "../repositories/localStorage/localStorageRepository";

export function getAllClients(): Client[] {
    return getData().clients
}

export function getClientById(clientId: string): Client | undefined {
    return getData().clients.find((client) => client.id === clientId)
}

export function createClient(
    client: Omit<Client, 'id' | 'createdAt'>,
): Client {
    const data = getData()

    const newClient: Client = {
        ...client,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    }

    data.clients.push(newClient)

    saveData(data)

    return newClient
}

export function updateClient(
    clientId: string,
    updates: Partial<Omit<Client, 'id' | 'workspaceId' | 'createdAt'>>,
  ): Client {
    const data = getData()
  
    const clientIndex = data.clients.findIndex(
      (client) => client.id === clientId,
    )
  
    if (clientIndex === -1) {
      throw new Error('Client not found.')
    }
  
    const updatedClient: Client = {
      ...data.clients[clientIndex],
      ...updates,
    }
  
    data.clients[clientIndex] = updatedClient
  
    saveData(data)
  
    return updatedClient
}


export function deleteClient(clientId: string): void {
    const data = getData()
  
    const clientExists = data.clients.some(
      (client) => client.id === clientId,
    )
  
    if (!clientExists) {
      throw new Error('Client not found.')
    }
  
    const hasProjects = data.projects.some(
      (project) => project.clientId === clientId,
    )
  
    if (hasProjects) {
      throw new Error(
        'Cannot delete a client that has associated projects.',
      )
    }
  
    data.clients = data.clients.filter(
      (client) => client.id !== clientId,
    )
  
    saveData(data)
}