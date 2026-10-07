export type ClientStatus = 'ACTIVE' | 'INACTIVE'

export interface Client {
    id: string
    workspaceId: string
    name: string
    email: string
    phone?: string
    industry: string
    status: ClientStatus
    notes?: string
    createdAt: string
}