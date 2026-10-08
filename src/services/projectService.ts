import type { Project } from '../interfaces/Project'
import {
  getData,
  saveData,
} from '../repositories/localStorage/localStorageRepository'

export function getAllProjects(): Project[] {
    return getData().projects
}

export function getProjectById(
    projectId: string,
): Project | undefined {
    return getData().projects.find(
        (project) => project.id === projectId,
    )
}

export function createProject(
    project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
): Project {
    const data = getData()

    const client = data.clients.find(
        (item) => item.id === project.clientId,
    )

    if (!client) {
        throw new Error("Client not found.")
    }

    if (client.workspaceId != project.workspaceId) {
        throw new Error(
            'Cannot create a project for a client from another workspace.'
        )
    }

    if (project.dueDate < project.startDate) {
        throw new Error(
            'Project due date cannot be earlier than the start date.'
        )
    }

    const now = new Date().toISOString()

    const newProject: Project = {
        ...project,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
    }

    data.projects.push(newProject)

    saveData(data)

    return newProject
}

export function updateProject(
    projectId: string,
    updates: Partial<
      Omit<Project, 'id' | 'workspaceId' | 'createdAt'>
    >,
  ): Project {
    const data = getData()
  
    const projectIndex = data.projects.findIndex(
      (project) => project.id === projectId,
    )
  
    if (projectIndex === -1) {
      throw new Error('Project not found.')
    }
  
    const currentProject = data.projects[projectIndex]
  
    const updatedProject: Project = {
      ...currentProject,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
  
    const client = data.clients.find(
      (item) => item.id === updatedProject.clientId,
    )
  
    if (!client) {
      throw new Error('Client not found.')
    }
  
    if (client.workspaceId !== updatedProject.workspaceId) {
      throw new Error(
        'Cannot assign a project to a client from another workspace.',
      )
    }
  
    if (updatedProject.dueDate < updatedProject.startDate) {
      throw new Error(
        'Project due date cannot be earlier than the start date.',
      )
    }
  
    if (updatedProject.status === 'COMPLETED') {
      const projectTasks = data.tasks.filter(
        (task) => task.projectId === projectId,
      )
  
      const hasIncompleteTasks = projectTasks.some(
        (task) => task.status !== 'COMPLETED',
      )
  
      if (hasIncompleteTasks) {
        throw new Error(
          'Cannot complete a project while it has incomplete tasks.',
        )
      }
    }
  
    data.projects[projectIndex] = updatedProject
  
    saveData(data)
  
    return updatedProject
}


export function deleteProject(projectId: string): void {
    const data = getData()

    const projectExists = data.projects.some(
        (project) => project.id === projectId,
    )

    if (!projectExists) {
        throw new Error('Project not found.')
    }

    const hasTasks = data.tasks.some(
        (task) => task.projectId === projectId
    )

    if (hasTasks) {
        throw new Error(
            'Cannot delete a project that has associated tasks.'
        )
    }

    data.projects = data.projects.filter(
        (project) => project.id !== projectId,
    )

    saveData(data)
}


export function calculateProjectProgress(
    projectId: string,
): number {
    const data = getData() 

    const projectExists = data.projects.some(
        (project) => project.id === projectId,
    )

    if (!projectExists) {
        throw new Error('Project not found.')
    }

    const projectTasks = data.tasks.filter(
        (task) => task.projectId === projectId,
    )

    if (projectTasks.length === 0) {
        return 0
    }

    const completedTasks = projectTasks.filter(
        (task) => task.status === 'COMPLETED',
    )

    return Math.round(
        (completedTasks.length / projectTasks.length) * 100,
    )
}