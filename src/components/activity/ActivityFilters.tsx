import type { ActivityEntityType } from '../../interfaces/Activity'

export interface ActivityFiltersState {
  entityType: ActivityEntityType | ''
}

interface ActivityFiltersProps {
  filters: ActivityFiltersState
  onChange: (filters: ActivityFiltersState) => void
}

const entityTypeLabels: Record<ActivityEntityType, string> = {
  CLIENT: 'Clients',
  PROJECT: 'Projects',
  TASK: 'Tasks',
  USER: 'Users',
}

function ActivityFilters({
  filters,
  onChange,
}: ActivityFiltersProps) {
  const handleEntityTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    onChange({
      entityType: event.target.value as ActivityEntityType | '',
    })
  }

  const handleClear = () => {
    onChange({
      entityType: '',
    })
  }

  const hasActiveFilters = filters.entityType !== ''

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-xs">
          <label
            htmlFor="activity-entity-type"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Type
          </label>

          <select
            id="activity-entity-type"
            value={filters.entityType}
            onChange={handleEntityTypeChange}
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          >
            <option value="">All activity</option>

            {(
              Object.keys(entityTypeLabels) as ActivityEntityType[]
            ).map((entityType) => (
              <option
                key={entityType}
                value={entityType}
              >
                {entityTypeLabels[entityType]}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleClear}
          disabled={!hasActiveFilters}
          className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

export default ActivityFilters