import type { Task } from "../interfaces/Task";

export function isTaskOverdue(task: Task): boolean {
    const today = new Date().toISOString().slice(0, 10)

    return (
        task.dueDate < today &&
        task.status !== 'COMPLETED'
    )
}