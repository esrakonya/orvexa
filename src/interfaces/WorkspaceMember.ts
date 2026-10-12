export interface WorkspaceMember {
    id: string
    workspaceId: string
    name: string
    email: string
    role: 'ADMIN' | 'PROJECT_MANAGER' | 'MEMBER'
}