export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED'

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Task {
    id: string
    workspaceId: string
    projectId: string
    title: string
    description: string
    status: TaskStatus
    priority: TaskPriority
    assigneeId: string
    dueDate: string
    createdAt: string
    updatedAt: string
}