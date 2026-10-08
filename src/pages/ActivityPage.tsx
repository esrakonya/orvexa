import { useState } from 'react'
import ActivityFeed from '../components/activity/ActivityFeed'
import ActivityFilters, {
  type ActivityFiltersState,
} from '../components/activity/ActivityFilters'
import { getAllActivities } from '../services/activityService'
import { getAllUsers } from '../services/userService'

function ActivityPage() {
  const [filters, setFilters] = useState<ActivityFiltersState>({
    entityType: '',
  })

  const activities = getAllActivities()
  const users = getAllUsers()

  const filteredActivities = activities
    .filter((activity) => {
      return (
        filters.entityType === '' ||
        activity.entityType === filters.entityType
      )
    })
    .sort((firstActivity, secondActivity) =>
      secondActivity.createdAt.localeCompare(
        firstActivity.createdAt,
      ),
    )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Activity
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Track recent activity across your workspace.
        </p>
      </div>

      <ActivityFilters
        filters={filters}
        onChange={setFilters}
      />

      <ActivityFeed
        activities={filteredActivities}
        users={users}
      />
    </div>
  )
}

export default ActivityPage