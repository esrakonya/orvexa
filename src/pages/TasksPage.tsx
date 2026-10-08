import { useState } from 'react'
import TaskFilters, {
  type TaskFiltersState,
} from '../components/tasks/TaskFilters'
import TaskForm from '../components/tasks/TaskForm'
import type {
  Task,
  TaskPriority,
  TaskStatus,
} from '../interfaces/Task'
import {
  createTask,
  deleteTask,
  getAllTasks,
  updateTask,
} from '../services/taskService'
import { getAllProjects } from '../services/projectService'
import { getAllUsers } from '../services/userService'
import { isTaskOverdue } from '../utils/taskUtils'

interface TaskFormData {
  projectId: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string
  dueDate: string
}

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(() =>
    getAllTasks(),
  )

  const [projects] = useState(() =>
    getAllProjects(),
  )

  const [users] = useState(() =>
    getAllUsers(),
  )

  const [filters, setFilters] =
    useState<TaskFiltersState>({
      search: '',
      projectId: '',
      assigneeId: '',
      status: '',
      priority: '',
      overdue: false,
    })

  const [isFormOpen, setIsFormOpen] =
    useState(false)

  const [editingTask, setEditingTask] =
    useState<Task | null>(null)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const handleFilterChange = (
    field: keyof TaskFiltersState,
    value: string | boolean,
  ) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      projectId: '',
      assigneeId: '',
      status: '',
      priority: '',
      overdue: false,
    })
  }

  const filteredTasks = tasks.filter((task) => {
    const normalizedSearch =
      filters.search.trim().toLowerCase()

    if (
      normalizedSearch &&
      !task.title
        .toLowerCase()
        .includes(normalizedSearch)
    ) {
      return false
    }

    if (
      filters.projectId &&
      task.projectId !== filters.projectId
    ) {
      return false
    }

    if (
      filters.assigneeId &&
      task.assigneeId !== filters.assigneeId
    ) {
      return false
    }

    if (
      filters.status &&
      task.status !== filters.status
    ) {
      return false
    }

    if (
      filters.priority &&
      task.priority !== filters.priority
    ) {
      return false
    }

    if (
      filters.overdue &&
      !isTaskOverdue(task)
    ) {
      return false
    }

    return true
  })

  const handleSubmitTask = (
    formData: TaskFormData,
  ) => {
    try {
      if (editingTask) {
        const updatedTask = updateTask(
          editingTask.id,
          formData,
        )

        setTasks((current) =>
          current.map((task) =>
            task.id === updatedTask.id
              ? updatedTask
              : task,
          ),
        )

        setEditingTask(null)
        setIsFormOpen(false)
        setErrorMessage(null)

        return
      }

      const newTask = createTask({
        ...formData,
        workspaceId: 'workspace-1',
      })

      setTasks((current) => [
        ...current,
        newTask,
      ])

      setIsFormOpen(false)
      setErrorMessage(null)
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage(
          'An unexpected error occurred.',
        )
      }
    }
  }

  const handleDeleteTask = (
    taskId: string,
  ) => {
    const task = tasks.find(
      (item) => item.id === taskId,
    )

    if (!task) {
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`,
    )

    if (!confirmed) {
      return
    }

    try {
      deleteTask(taskId)

      setTasks((current) =>
        current.filter(
          (item) => item.id !== taskId,
        ),
      )

      setErrorMessage(null)
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage(
          'An unexpected error occurred.',
        )
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tasks
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Manage and track your organization's tasks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingTask(null)
            setErrorMessage(null)
            setIsFormOpen(true)
          }}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Add Task
        </button>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      )}

      <TaskFilters
        filters={filters}
        projects={projects}
        users={users}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {isFormOpen && (
        <TaskForm
          projects={projects}
          users={users}
          initialData={
            editingTask
              ? {
                  projectId:
                    editingTask.projectId,
                  title: editingTask.title,
                  description:
                    editingTask.description,
                  status: editingTask.status,
                  priority:
                    editingTask.priority,
                  assigneeId:
                    editingTask.assigneeId,
                  dueDate:
                    editingTask.dueDate,
                }
              : undefined
          }
          submitLabel={
            editingTask
              ? 'Save Changes'
              : 'Add Task'
          }
          onSubmit={handleSubmitTask}
          onCancel={() => {
            setIsFormOpen(false)
            setEditingTask(null)
            setErrorMessage(null)
          }}
        />
      )}

      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <div className="grid grid-cols-7 border-b bg-gray-50 px-6 py-3 text-sm font-medium text-gray-600">
          <span>Task</span>
          <span>Project</span>
          <span>Assignee</span>
          <span>Priority</span>
          <span>Status</span>
          <span>Due Date</span>
          <span className="text-right">
            Actions
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-gray-900">
              No tasks found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your filters or create a
              new task.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const project = projects.find(
              (item) =>
                item.id === task.projectId,
            )

            const assignee = users.find(
              (user) =>
                user.id === task.assigneeId,
            )

            return (
              <div
                key={task.id}
                className="grid grid-cols-7 items-center border-b px-6 py-4 text-sm last:border-b-0"
              >
                <span className="font-medium text-gray-900">
                  {task.title}
                </span>

                <span className="text-gray-600">
                  {project?.name ??
                    'Unknown project'}
                </span>

                <span className="text-gray-600">
                  {assignee?.name ??
                    'Unknown user'}
                </span>

                <span className="text-gray-600">
                  {task.priority}
                </span>

                <span className="text-gray-600">
                  {task.status}
                </span>

                <div>
                  <span
                    className={
                      isTaskOverdue(task)
                        ? 'font-medium text-red-600'
                        : 'text-gray-600'
                    }
                  >
                    {task.dueDate}
                  </span>

                  {isTaskOverdue(task) && (
                    <span className="ml-2 text-xs font-medium text-red-600">
                      Overdue
                    </span>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTask(task)
                      setErrorMessage(null)
                      setIsFormOpen(true)
                    }}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteTask(task.id)
                    }
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default TasksPage