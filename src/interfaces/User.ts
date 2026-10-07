export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'MEMBER'

export interface User {
    id: string
    workspaceId: string
    name: string
    email: string
    role: UserRole
    avatarUrl?: string
}