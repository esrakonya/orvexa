import type { Project, ProjectStatus } from '../../interfaces/Project'

interface ProjectProgressItem {
    project: Project
    progress: number
}

interface ProjectProgressListProps {
    projects: ProjectProgressItem[]
}

function getProgressColor(status: ProjectStatus) {
    switch (status) {
        case 'PLANNING':
            return 'bg-planning-500'

        case 'IN_PROGRESS':
            return 'bg-info-500'

        case 'ON_HOLD':
            return 'bg-warning-500'

        case 'COMPLETED':
            return 'bg-success-500'

        default:
            return 'bg-sage'
    }
}

function ProjectProgressList({
    projects,
}: ProjectProgressListProps) {
    return (
        <section className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-5">
                <h2 className="text-lg font-semibold text-forest">
                    Project Progress
                </h2>

                <p className="mt-1 text-sm text-sage">
                    Current progress based on completed tasks.
                </p>
            </div>

            <div className="space-y-5">
                {projects.map(({ project, progress }) => (
                    <div key={project.id}>
                        <div className="mb-2 flex items-center justify-between gap-4">
                            <span className="truncate text-sm font-medium text-forest">
                                {project.name}
                            </span>

                            <span className="shrink-0 text-sm font-medium text-sage">
                                {progress}%
                            </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-sage-mist">
                            <div
                                className={`h-full rounded-full transition-all ${getProgressColor(project.status)}`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default ProjectProgressList