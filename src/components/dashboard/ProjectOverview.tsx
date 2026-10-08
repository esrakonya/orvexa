import { Link } from 'react-router-dom'
import type { Client } from '../../interfaces/Client'
import type { Project, ProjectStatus } from '../../interfaces/Project'

interface ProjectOverviewItem {
  project: Project
  client: Client | undefined
  progress: number
}

interface ProjectOverviewProps {
  projects: ProjectOverviewItem[]
}

const projectStatusLabels: Record<ProjectStatus, string> = {
  PLANNING: 'Planning',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
}

function ProjectOverview({
  projects,
}: ProjectOverviewProps) {
  const visibleProjects = projects.slice(0, 5)

  return (
    <section className="rounded-xl border bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b p-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Project Overview
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            A quick overview of your current projects.
          </p>
        </div>

        <Link
          to="/projects"
          className="shrink-0 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          View all
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Project
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Client
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Progress
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {visibleProjects.map(
              ({ project, client, progress }) => (
                <tr key={project.id}>
                  <td className="px-5 py-4">
                    <Link
                      to={`/projects/${project.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {project.name}
                    </Link>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {client?.name ?? 'Unknown client'}
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                      {projectStatusLabels[project.status]}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex min-w-32 items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-gray-900"
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>

                      <span className="w-10 text-right text-sm text-gray-600">
                        {progress}%
                      </span>
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default ProjectOverview