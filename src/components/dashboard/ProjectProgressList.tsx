import type { Project } from "../../interfaces/Project";

interface ProjectProgressItem {
    project: Project
    progress: number
}

interface ProjectProgressListProps {
    projects: ProjectProgressItem[]
}

function ProjectProgressList({
    projects,
}: ProjectProgressListProps) {
    return (
        <section className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                    Project Progress
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Current progress based on completed tasks.
                </p>
            </div>

            <div className="space-y-5">
                {projects.map(({ project, progress }) => (
                    <div key={project.id}>
                        <div className="mb-2 flex items-center justify-between gap-4">
                            <span className="truncate text-sm font-medium text-gray-700">
                                {project.name}
                            </span>

                            <span className="text-sm font-medium text-gray-500">
                                {progress}%
                            </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                                className="h-full rounded-full bg-gray-900 transition-all"
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