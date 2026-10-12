import { useEffect, useMemo, useState } from 'react'
import type { Client } from '../interfaces/Client'
import type { Project } from '../interfaces/Project'
import { getAllActivities } from '../services/activityService'
import { getAllClients } from '../services/clientService'
import { getAllProjects } from '../services/projectService'
import { getAllTasks } from '../services/taskService'
import { getAllUsers } from '../services/userService'
import { isTaskOverdue } from '../utils/taskUtils'
import type { Activity } from '../interfaces/Activity'
import type { Task } from '../interfaces/Task'
import type { User } from '../interfaces/User'

function useDashboardData() {
  const [clients, setClients] = useState<Client[]>([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [clientsError, setClientsError] = useState<string | null>(null)

  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState<string | null>(null)

  const [tasks, setTasks] = useState<Task[]>([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState<string | null>(null)

  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)

  const [activities, setActivities] = useState<Activity[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [activitiesError, setActivitiesError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadClients() {
      try {
        const data = await getAllClients()
        if (isMounted) {
          setClients(data)
          setClientsError(null)
        }
      } catch (error: unknown) {
        if (isMounted) {
          setClientsError(
            error instanceof Error ? error.message : 'Clients could not be loaded.',
          )
        }
      } finally {
        if (isMounted) setClientsLoading(false)
      }
    }

    void loadClients()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadProjects() {
      try {
        const data = await getAllProjects()
        if (isMounted) {
          setProjects(data)
          setProjectsError(null)
        }
      } catch (error: unknown) {
        if (isMounted) {
          setProjectsError(
            error instanceof Error ? error.message : 'Projects could not be loaded.',
          )
        }
      } finally {
        if (isMounted) setProjectsLoading(false)
      }
    }

    void loadProjects()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadTasks() {
      try {
        const result = await getAllTasks()
        if (isMounted) {
          setTasks(result)
          setTasksError(null)
        }
      } catch (error: unknown) {
        if (isMounted) {
          setTasksError(
            error instanceof Error ? error.message : 'Could not load tasks.',
          )
        }
      } finally {
        if (isMounted) setTasksLoading(false)
      }
    }

    void loadTasks()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadUsers() {
      try {
        const result = await getAllUsers()
        if (isMounted) {
          setUsers(result)
          setUsersError(null)
        }
      } catch (error: unknown) {
        if (isMounted) {
          setUsersError(
            error instanceof Error ? error.message : 'Could not load team members.',
          )
        }
      } finally {
        if (isMounted) setUsersLoading(false)
      }
    }

    void loadUsers()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadActivities() {
      try {
        const result = await getAllActivities()
        if (isMounted) {
          setActivities(result)
          setActivitiesError(null)
        }
      } catch (error: unknown) {
        if (isMounted) {
          setActivitiesError(
            error instanceof Error ? error.message : 'Could not load activities.',
          )
        }
      } finally {
        if (isMounted) setActivitiesLoading(false)
      }
    }

    void loadActivities()
    return () => {
      isMounted = false
    }
  }, [])

  const dashboardData = useMemo(() => {
    const activeProjects = projects.filter(
      (project) => project.status !== 'COMPLETED',
    )

    const openTasks = tasks.filter(
      (task) => task.status !== 'COMPLETED',
    )

    const overdueTasks = tasks.filter(isTaskOverdue)

    const activeClients = clients.filter(
      (client) => client.status === 'ACTIVE',
    )

    function calculateProgress(projectId: string): number {
      const projectTasks = tasks.filter(
        (task) => task.projectId === projectId,
      )

      if (projectTasks.length === 0) return 0

      const completedTasks = projectTasks.filter(
        (task) => task.status === 'COMPLETED',
      ).length

      return Math.round((completedTasks / projectTasks.length) * 100)
    }

    const projectProgress = projects.map((project) => ({
      project,
      progress: calculateProgress(project.id),
    }))

    const taskStatusSummary = {
      TODO: tasks.filter((task) => task.status === 'TODO').length,
      IN_PROGRESS: tasks.filter(
        (task) => task.status === 'IN_PROGRESS',
      ).length,
      COMPLETED: tasks.filter(
        (task) => task.status === 'COMPLETED',
      ).length,
    }

    const projectOverview = projects.map((project) => ({
      project,
      client: clients.find((client) => client.id === project.clientId),
      progress: calculateProgress(project.id),
    }))

    const upcomingTasks = [...tasks]
      .filter((task) => task.status !== 'COMPLETED')
      .sort((firstTask, secondTask) =>
        firstTask.dueDate.localeCompare(secondTask.dueDate),
      )
      .slice(0, 5)
      .map((task) => ({
        task,
        project: projects.find((project) => project.id === task.projectId),
        assignee: users.find((user) => user.id === task.assigneeId),
      }))

    const recentActivities = [...activities]
      .sort((firstActivity, secondActivity) =>
        secondActivity.createdAt.localeCompare(firstActivity.createdAt),
      )
      .slice(0, 5)

    return {
      kpis: {
        activeProjects: activeProjects.length,
        openTasks: openTasks.length,
        overdueTasks: overdueTasks.length,
        activeClients: activeClients.length,
      },
      projectProgress,
      taskStatusSummary,
      projectOverview,
      upcomingTasks,
      recentActivities,
      users,
    }
  }, [activities, clients, projects, tasks, users])

  return {
    ...dashboardData,
    clientsLoading,
    clientsError,
    projectsLoading,
    projectsError,
    tasksLoading,
    tasksError,
    usersLoading,
    usersError,
    activitiesLoading,
    activitiesError,
  }
}

export default useDashboardData