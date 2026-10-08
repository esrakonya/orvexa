import {
    AlertCircle,
    CheckSquare,
    FolderKanban,
    Users,
} from 'lucide-react'
import KpiCard from '../components/dashboard/KpiCard'
import ProjectProgressList from '../components/dashboard/ProjectProgressList'
import ProjectOverview from '../components/dashboard/ProjectOverview'
import RecentActivity from '../components/dashboard/RecentActivity'
import TaskStatusSummary from '../components/dashboard/TaskStatusSummary'
import UpcomingTasks from '../components/dashboard/UpcomingTasks'
import useDashboardData from '../hooks/useDashboardData'

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
                    icon={FolderKanban}
                    iconClassName="text-primary-600"
                    iconBackgroundClassName="bg-primary-50"
                />

                <KpiCard
                    label="Open Tasks"
                    value={kpis.openTasks}
                    icon={CheckSquare}
                    iconClassName="text-info-600"
                    iconBackgroundClassName="bg-info-50"
                />

                <KpiCard
                    label="Overdue Tasks"
                    value={kpis.overdueTasks}
                    icon={AlertCircle}
                    iconClassName="text-danger-600"
                    iconBackgroundClassName="bg-danger-50"
                />

                <KpiCard
                    label="Active Clients"
                    value={kpis.activeClients}
                    icon={Users}
                    iconClassName="text-success-600"
                    iconBackgroundClassName="bg-success-50"
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

            <section className='grid gap-6 lg:grid-cols-2'>
                <ProjectOverview projects={projectOverview} />

                <UpcomingTasks tasks={upcomingTasks} />
            </section>

            <RecentActivity activities={recentActivities} />
        </div>
    )
}

export default DashboardPage