
import { apiRequest } from '../api/apiClient'
import type { Task } from '../interfaces/Task'

const TASKS_ENDPOINT = '/api/tasks'

export type CreateTaskInput = Omit<
  Task,
  'id' | 'workspaceId' | 'createdAt' | 'updatedAt'
>

export type UpdateTaskInput = Partial<CreateTaskInput>

export function getAllTasks(): Promise<Task[]> {
  return apiRequest<Task[]>(TASKS_ENDPOINT)
}

export function getTaskById(taskId: string): Promise<Task> {
  return apiRequest<Task>(`${TASKS_ENDPOINT}/${taskId}`)
}

export function createTask(
  task: CreateTaskInput,
): Promise<Task> {
  return apiRequest<Task>(TASKS_ENDPOINT, {
    method: 'POST',
    body: task,
  })
}

export function updateTask(
  taskId: string,
  updates: UpdateTaskInput,
): Promise<Task> {
  return apiRequest<Task>(`${TASKS_ENDPOINT}/${taskId}`, {
    method: 'PATCH',
    body: updates,
  })
}

export function deleteTask(taskId: string): Promise<void> {
  return apiRequest<void>(`${TASKS_ENDPOINT}/${taskId}`, {
    method: 'DELETE',
  })
}