import {
    Check,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type {
    Activity,
    ActivityEntityType,
    ActivityType,
} from '../../interfaces/Activity'

interface RecentActivityProps {
    activities: Activity[]
}

const entityLabels: Record<ActivityEntityType, string> = {
    CLIENT: 'client',
    PROJECT: 'project',
    TASK: 'task',
    USER: 'team member',
}

const activityStyles: Record<
    ActivityType,
    {
        icon: typeof Plus
        iconClassName: string
        backgroundClassName: string
    }
> = {
    CREATED: {
        icon: Plus,
        iconClassName: 'text-success-600',
        backgroundClassName: 'bg-success-50',
    },
    UPDATED: {
        icon: Pencil,
        iconClassName: 'text-info-600',
        backgroundClassName: 'bg-info-50',
    },
    COMPLETED: {
        icon: Check,
        iconClassName: 'text-success-600',
        backgroundClassName: 'bg-success-50',
    },
    DELETED: {
        icon: Trash2,
        iconClassName: 'text-danger-600',
        backgroundClassName: 'bg-danger-50',
    },
}

function formatActivityDate(date: string): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(date))
}

function RecentActivity({
    activities,
}: RecentActivityProps) {
    return (
        <section className="rounded-xl border bg-white shadow-sm">
            <div className="flex items-start justify-between gap-4 border-b p-5">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Recent Activity
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Latest activity across your workspace.
                    </p>
                </div>

                <Link
                    to="/activity"
                    className="shrink-0 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                    View all
                </Link>
            </div>

            <div className="divide-y">
                {activities.map((activity) => {
                    const style = activityStyles[activity.type]
                    const Icon = style.icon

                    return (
                        <div
                            key={activity.id}
                            className="flex items-start gap-4 p-5"
                        >
                            <div
                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.backgroundClassName}`}
                            >
                                <Icon
                                    className={`h-4 w-4 ${style.iconClassName}`}
                                    aria-hidden="true"
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-gray-700">
                                    {activity.description}
                                </p>

                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                    <span>
                                        {entityLabels[activity.entityType]}
                                    </span>

                                    <span aria-hidden="true">·</span>

                                    <span>
                                        {formatActivityDate(activity.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

export default RecentActivity