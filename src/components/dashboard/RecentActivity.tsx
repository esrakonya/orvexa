import type {
    Activity,
    ActivityEntityType,
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
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h2>
  
          <p className="mt-1 text-sm text-gray-500">
            Latest activity across your workspace.
          </p>
        </div>
  
        <div className="divide-y">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-5"
            >
              <div className="mt-0.5 h-8 w-8 shrink-0 rounded-full bg-gray-100" />
  
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
          ))}
        </div>
      </section>
    )
}
  
export default RecentActivity