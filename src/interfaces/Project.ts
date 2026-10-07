export type ProjectStatus = 
    | 'PLANNING'
    | 'IN_PROGRESS'
    | 'ON_HOLD'
    | 'COMPLETED'

export interface Project {
    id: string
    workspaceId: string
    clientId: string
    name: string
    description: string
    status: ProjectStatus
    startDate: string
    dueDate: string
    createdAt: string
    updatedAt: string
}