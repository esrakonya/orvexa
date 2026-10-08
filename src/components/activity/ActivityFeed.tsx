import type {
    Activity,
    ActivityEntityType,
    ActivityType,
} from '../../interfaces/Activity'
import type { User } from '../../interfaces/User'
  
interface ActivityFeedProps {
    activities: Activity[]
    users: User[]
}
  
const activityTypeLabels: Record<ActivityType, string> = {
    CREATED: 'Created',
    UPDATED: 'Updated',
    DELETED: 'Deleted',
    COMPLETED: 'Completed',
}
  
const entityTypeLabels: Record<ActivityEntityType, string> = {
    CLIENT: 'Client',
    PROJECT: 'Project',
    TASK: 'Task',
    USER: 'User',
}
  
function formatActivityDate(date: string): string {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date))
}
  
function ActivityFeed({
    activities,
    users,
}: ActivityFeedProps) {
    if (activities.length === 0) {
      return (
        <section className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            No activity found
          </h2>
  
          <p className="mt-2 text-sm text-gray-500">
            There are no activities matching the selected filter.
          </p>
        </section>
      )
    }
  
    return (
      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="divide-y">
          {activities.map((activity) => {
            const user = users.find(
              (candidate) => candidate.id === activity.userId,
            )
  
            return (
              <article
                key={activity.id}
                className="flex gap-4 p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name.charAt(0).toUpperCase() ?? '?'}
                  </span>
                </div>
  
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">
                        {user?.name ?? 'Unknown user'}
                      </span>{' '}
                      {activity.description}
                    </p>
  
                    <time
                      dateTime={activity.createdAt}
                      className="shrink-0 text-xs text-gray-500"
                    >
                      {formatActivityDate(activity.createdAt)}
                    </time>
                  </div>
  
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                      {activityTypeLabels[activity.type]}
                    </span>
  
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                      {entityTypeLabels[activity.entityType]}
                    </span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    )
  }
  
  export default ActivityFeed