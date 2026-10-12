import { Link } from 'react-router-dom'
import type { Project } from '../../interfaces/Project'
import type { Task } from '../../interfaces/Task'
import type { User } from '../../interfaces/User'
import { isTaskOverdue } from '../../utils/taskUtils'

interface UpcomingTaskItem {
    task: Task
    project: Project | undefined
    assignee: User | undefined
}

interface UpcomingTasksProps {
    tasks: UpcomingTaskItem[]
}

function formatDueDate(date: string): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
    }).format(new Date(`${date}T00:00:00`))
}

function UpcomingTasks({
    tasks,
}: UpcomingTasksProps) {
    return (
        <section className="rounded-xl border bg-white shadow-sm">
            <div className="flex items-start justify-between gap-4 border-b p-5">
                <div>
                    <h2 className="text-lg font-semibold text-forest">
                        Upcoming Tasks
                    </h2>

                    <p className="mt-1 text-sm text-sage">
                        Tasks that need attention next.
                    </p>
                </div>

                <Link
                    to="/tasks"
                    className="shrink-0 text-sm font-medium text-forest hover:text-sage"
                >
                    View all
                </Link>
            </div>

            <div className="divide-y">
                {tasks.map(({ task, project, assignee }) => {
                    const overdue = isTaskOverdue(task)

                    return (
                        <div
                            key={task.id}
                            className="flex items-center justify-between gap-4 p-5"
                        >
                            <div className="min-w-0">
                                <p className="truncate font-medium text-forest">
                                    {task.title}
                                </p>

                                <p className="mt-1 truncate text-sm text-sage">
                                    {project?.name ?? 'Unknown project'}
                                    {' · '}
                                    {assignee?.name ?? 'Unassigned'}
                                </p>
                            </div>

                            <div className="shrink-0 text-right">
                                <p
                                    className={`text-sm font-medium ${overdue
                                            ? 'text-danger-600'
                                            : 'text-forest'
                                        }`}
                                >
                                    {formatDueDate(task.dueDate)}
                                </p>

                                {overdue && (
                                    <p className="mt-1 text-xs font-medium text-danger-600">
                                        Overdue
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

export default UpcomingTasks