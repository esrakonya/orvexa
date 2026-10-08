import type { User } from '../interfaces/User'
import {
  getData,
} from '../repositories/localStorage/localStorageRepository'

export function getAllUsers(): User[] {
  return getData().users
}

export function getUserById(
  userId: string,
): User | undefined {
  return getData().users.find(
    (user) => user.id === userId,
  )
}