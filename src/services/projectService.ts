import { apiRequest } from '../api/apiClient'
import type { Project } from '../interfaces/Project'

const PROJECTS_ENDPOINT = '/api/projects'

export type CreateProjectInput = Pick<
  Project,
  'clientId' | 'name' | 'description' | 'status' | 'startDate' | 'dueDate'
>

export type UpdateProjectInput = Partial<CreateProjectInput>

export function getAllProjects(): Promise<Project[]> {
  return apiRequest<Project[]>(PROJECTS_ENDPOINT)
}

export function getProjectById(projectId: string): Promise<Project> {
  return apiRequest<Project>(`${PROJECTS_ENDPOINT}/${projectId}`)
}

export function createProject(
  project: CreateProjectInput,
): Promise<Project> {
  return apiRequest<Project>(PROJECTS_ENDPOINT, {
    method: 'POST',
    body: project,
  })
}

export function updateProject(
  projectId: string,
  updates: UpdateProjectInput,
): Promise<Project> {
  return apiRequest<Project>(`${PROJECTS_ENDPOINT}/${projectId}`, {
    method: 'PATCH',
    body: updates,
  })
}

export function deleteProject(projectId: string): Promise<void> {
  return apiRequest<void>(`${PROJECTS_ENDPOINT}/${projectId}`, {
    method: 'DELETE',
  })
}