import type { Workspace } from "../interfaces/Workspace";
import {
    getData,
    saveData,
} from '../repositories/localStorage/localStorageRepository'

export function getWorkspace(): Workspace {
    return getData().workspace
}

export function updateWorkspace(
    updates: Pick<Workspace, 'name' | 'industry'>
): Workspace {
    const data = getData()
    const trimmedName = updates.name.trim()

    if (!trimmedName) {
        throw new Error('Workspace name is required.')
    }

    const updatedWorkspace: Workspace = {
        ...data.workspace,
        name: trimmedName,
        industry: updates.industry?.trim() || undefined,
    }

    data.workspace = updatedWorkspace
    saveData(data)

    return updatedWorkspace
}