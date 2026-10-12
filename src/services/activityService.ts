import { apiRequest } from '../api/apiClient'
import type { Activity } from '../interfaces/Activity'

const ACTIVITIES_ENDPOINT = '/api/activities'

export function getAllActivities(): Promise<Activity[]> {
    return apiRequest<Activity[]>(ACTIVITIES_ENDPOINT)
}