import { useMemo } from 'react'
import { getAllActivities } from '../services/activityService'
import { getAllClients } from '../services/clientService'
import {
  calculateProjectProgress,
  getAllProjects,
} from '../services/projectService'
import { getAllTasks } from '../services/taskService'
import { getAllUsers } from '../services/userService'
import { isTaskOverdue } from '../utils/taskUtils'

function useDashboardData() {
  const clients = getAllClients()
  const projects = getAllProjects()
  const tasks = getAllTasks()
  const users = getAllUsers()
  const activities = getAllActivities()

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

    const projectProgress = projects.map((project) => ({
      project,
      progress: calculateProjectProgress(project.id),
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
      client: clients.find(
        (client) => client.id === project.clientId,
      ),
      progress: calculateProjectProgress(project.id),
    }))

    const upcomingTasks = [...tasks]
      .filter((task) => task.status !== 'COMPLETED')
      .sort((firstTask, secondTask) =>
        firstTask.dueDate.localeCompare(secondTask.dueDate),
      )
      .slice(0, 5)

    const recentActivities = [...activities]
      .sort((firstActivity, secondActivity) =>
        secondActivity.createdAt.localeCompare(
          firstActivity.createdAt,
        ),
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

  return dashboardData
}

export default useDashboardData