import KpiCard from '../components/dashboard/KpiCard'
import ProjectProgressList from '../components/dashboard/ProjectProgressList'
import TaskStatusSummary from '../components/dashboard/TaskStatusSummary'
import ProjectOverview from '../components/dashboard/ProjectOverview'
import useDashboardData from '../hooks/useDashboardData'
import UpcomingTasks from '../components/dashboard/UpcomingTasks'
import RecentActivity from '../components/dashboard/RecentActivity'

function DashboardPage() {
  const {
    kpis,
    projectProgress,
    taskStatusSummary,
    projectOverview,
    upcomingTasks,
    recentActivities,
  } = useDashboardData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Get an overview of your workspace and ongoing work.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active Projects"
          value={kpis.activeProjects}
        />

        <KpiCard
          label="Open Tasks"
          value={kpis.openTasks}
        />

        <KpiCard
          label="Overdue Tasks"
          value={kpis.overdueTasks}
        />

        <KpiCard
          label="Active Clients"
          value={kpis.activeClients}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ProjectProgressList
          projects={projectProgress}
        />

        <TaskStatusSummary
          summary={taskStatusSummary}
        />
      </section>

      <ProjectOverview projects={projectOverview} />

      <UpcomingTasks tasks={upcomingTasks} />

      <RecentActivity activities={recentActivities} />
    </div>
  )
}

export default DashboardPage