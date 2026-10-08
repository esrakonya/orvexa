import type { Task } from '../interfaces/Task'
import {
  getData,
  saveData,
} from '../repositories/localStorage/localStorageRepository'

export function getAllTasks(): Task[] {
  return getData().tasks
}

export function getTaskById(
  taskId: string,
): Task | undefined {
  return getData().tasks.find(
    (task) => task.id === taskId,
  )
}

export function createTask(
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
): Task {
  const data = getData()

  const project = data.projects.find(
    (item) => item.id === task.projectId,
  )

  if (!project) {
    throw new Error('Project not found.')
  }

  if (project.workspaceId !== task.workspaceId) {
    throw new Error(
      'Cannot create a task for a project from another workspace.',
    )
  }

  if (project.status === 'COMPLETED') {
    throw new Error(
      'Cannot create a task for a completed project.',
    )
  }

  const assignee = data.users.find(
    (user) => user.id === task.assigneeId,
  )

  if (!assignee) {
    throw new Error('Assignee not found.')
  }

  if (assignee.workspaceId !== project.workspaceId) {
    throw new Error(
      'Cannot assign a task to a user from another workspace.',
    )
  }

  if (!task.title.trim()) {
    throw new Error('Task title cannot be empty.')
  }

  if (task.dueDate > project.dueDate) {
    throw new Error(
      'Task due date cannot be later than the project due date.',
    )
  }

  const now = new Date().toISOString()

  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }

  data.tasks.push(newTask)

  saveData(data)

  return newTask
}

export function updateTask(
  taskId: string,
  updates: Partial<
    Omit<Task, 'id' | 'workspaceId' | 'createdAt'>
  >,
): Task {
  const data = getData()

  const taskIndex = data.tasks.findIndex(
    (task) => task.id === taskId,
  )

  if (taskIndex === -1) {
    throw new Error('Task not found.')
  }

  const currentTask = data.tasks[taskIndex]

  const updatedTask: Task = {
    ...currentTask,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  const project = data.projects.find(
    (item) => item.id === updatedTask.projectId,
  )

  if (!project) {
    throw new Error('Project not found.')
  }

  if (project.workspaceId !== updatedTask.workspaceId) {
    throw new Error(
      'Cannot assign a task to a project from another workspace.',
    )
  }

  const assignee = data.users.find(
    (user) => user.id === updatedTask.assigneeId,
  )

  if (!assignee) {
    throw new Error('Assignee not found.')
  }

  if (assignee.workspaceId !== project.workspaceId) {
    throw new Error(
      'Cannot assign a task to a user from another workspace.',
    )
  }

  if (!updatedTask.title.trim()) {
    throw new Error('Task title cannot be empty.')
  }

  if (updatedTask.dueDate > project.dueDate) {
    throw new Error(
      'Task due date cannot be later than the project due date.',
    )
  }

  data.tasks[taskIndex] = updatedTask

  saveData(data)

  return updatedTask
}

export function deleteTask(taskId: string): void {
  const data = getData()

  const taskExists = data.tasks.some(
    (task) => task.id === taskId,
  )

  if (!taskExists) {
    throw new Error('Task not found.')
  }

  data.tasks = data.tasks.filter(
    (task) => task.id !== taskId,
  )

  saveData(data)
}