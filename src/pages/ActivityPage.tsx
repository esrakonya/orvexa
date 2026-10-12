import { useEffect, useState } from 'react'
import ActivityFeed from '../components/activity/ActivityFeed'
import ActivityFilters, {
  type ActivityFiltersState,
} from '../components/activity/ActivityFilters'
import type { Activity } from '../interfaces/Activity'
import { getAllActivities } from '../services/activityService'
import { getAllUsers } from '../services/userService'
import type { User } from '../interfaces/User'

function ActivityPage() {
  const [filters, setFilters] = useState<ActivityFiltersState>({
    entityType: '',
  })

  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(true)
  const [activitiesError, setActivitiesError] = useState<string | null>(null)

  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadActivities() {
      try {
        const result = await getAllActivities()
        if (isMounted) {
          setActivities(result)
          setActivitiesError(null)
        }
      } catch (error: unknown) {
        if (isMounted) {
          setActivitiesError(
            error instanceof Error ? error.message : 'Could not load activities.',
          )
        }
      } finally {
        if (isMounted) setIsLoadingActivities(false)
      }
    }

    void loadActivities()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadUsers() {
      try {
        const result = await getAllUsers()
        if (isMounted) {
          setUsers(result)
          setUsersError(null)
        }
      } catch (error: unknown) {
        if (isMounted) {
          setUsersError(
            error instanceof Error ? error.message : 'Could not load team members.',
          )
        }
      } finally {
        if (isMounted) setIsLoadingUsers(false)
      }
    }

    void loadUsers()
    return () => {
      isMounted = false
    }
  }, [])

  const filteredActivities = activities
    .filter((activity) =>
      filters.entityType === '' ||
      activity.entityType === filters.entityType,
    )
    .sort((firstActivity, secondActivity) =>
      secondActivity.createdAt.localeCompare(firstActivity.createdAt),
    )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-forest">
          Activity
        </h1>

        <p className="mt-1 text-sm text-sage">
          Track recent activity across your workspace.
        </p>
      </div>

      {isLoadingActivities && (
        <p className="text-sm text-sage">
          Loading activities...
        </p>
      )}

      {activitiesError && (
        <p role="alert" className="text-sm text-red-600">
          Could not load activities: {activitiesError}
        </p>
      )}

      {isLoadingUsers && (
        <p className="text-sm text-sage">
          Loading team members...
        </p>
      )}

      {usersError && (
        <p role="alert" className="text-sm text-red-600">
          Could not load team members: {usersError}
        </p>
      )}

      <ActivityFilters
        filters={filters}
        onChange={setFilters}
      />

      {!isLoadingActivities && !activitiesError && (
        <ActivityFeed
          activities={filteredActivities}
          users={users}
        />
      )}
    </div>
  )
}

export default ActivityPage