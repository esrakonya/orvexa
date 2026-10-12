import { apiRequest } from '../api/apiClient'
import type { User } from '../interfaces/User'
import type { WorkspaceMember } from '../interfaces/WorkspaceMember'

const WORKSPACE_MEMBERS_ENDPOINT = '/api/workspace-members'

export function getAllUsers(): Promise<WorkspaceMember[]> {
  return apiRequest<User[]>(WORKSPACE_MEMBERS_ENDPOINT)
}