import type { Activity } from "../interfaces/Activity";
import {
    getData,
} from '../repositories/localStorage/localStorageRepository'

export function getAllActivities(): Activity[] {
    return getData().activities
}