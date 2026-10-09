import { useState } from 'react'
import ProjectForm from '../components/projects/ProjectForm'
import ProjectFilters, {
    type ProjectFiltersState,
} from '../components/projects/ProjectFilters'
import type { Project, ProjectStatus } from '../interfaces/Project'
import {
    createProject,
    deleteProject,
    getAllProjects,
    updateProject,
} from '../services/projectService'
import { getAllClients } from '../services/clientService'
import { formatDate } from '../utils/dateUtils'

interface ProjectFormData {
    clientId: string
    name: string
    description: string
    status: ProjectStatus
    startDate: string
    dueDate: string
}

function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>(() =>
        getAllProjects(),
    )

    const [clients] = useState(() => getAllClients())

    const [filters, setFilters] =
        useState<ProjectFiltersState>({
            search: '',
            status: '',
            clientId: '',
        }
    )

    const [isFormOpen, setIsFormOpen] = useState(false)

    const [editingProject, setEditingProject] =
        useState<Project | null>(null)

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null)

    const handleSubmitProject = (
        formData: ProjectFormData,
    ) => {
        try {
            if (editingProject) {
                const updatedProject = updateProject(
                    editingProject.id,
                    formData,
                )

                setProjects((current) =>
                    current.map((project) =>
                        project.id === updatedProject.id
                            ? updatedProject
                            : project,
                    ),
                )

                setEditingProject(null)
                setIsFormOpen(false)
                setErrorMessage(null)

                return
            }

            const newProject = createProject({
                ...formData,
                workspaceId: 'workspace-1',
            })

            setProjects((current) => [
                ...current,
                newProject,
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

    const filteredProjects = projects.filter((project) => {
        const matchesSearch = project.name
            .toLowerCase()
            .includes(filters.search.toLowerCase().trim())

        const matchesStatus =
            filters.status === '' ||
            project.status === filters.status

        const matchesClient =
            filters.clientId === '' ||
            project.clientId === filters.clientId

        return (
            matchesSearch &&
            matchesStatus &&
            matchesClient
        )
    })

    const getProjectStatusLabel = (
        status: ProjectStatus
    ): string => {
        const labels: Record<ProjectStatus, string> = {
            PLANNING: 'Planning',
            IN_PROGRESS: 'In Progress',
            ON_HOLD: 'On Hold',
            COMPLETED: 'Completed',
        }

        return labels[status]
    }


    const getProjectStatusClassName = (
        status: ProjectStatus,
    ): string => {
        const classes: Record<ProjectStatus, string> = {
            PLANNING:
                'bg-planning-50 text-planning-700',
            IN_PROGRESS:
                'bg-info-50 text-info-700',
            ON_HOLD:
                'bg-warning-50 text-warning-700',
            COMPLETED:
                'bg-success-50 text-success-700',
        }

        return classes[status]
    }

    const hasActiveFilters =
        filters.search !== '' ||
        filters.status !== '' ||
        filters.clientId !== ''

    const handleDeleteProject = (
        projectId: string,
    ) => {
        const project = projects.find(
            (item) => item.id === projectId,
        )

        if (!project) {
            return
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${project.name}"?`,
        )

        if (!confirmed) {
            return
        }

        try {
            deleteProject(projectId)

            setProjects((current) =>
                current.filter(
                    (item) => item.id !== projectId,
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
                        Projects
                    </h1>

                    <p className="mt-1 text-sm text-gray-600">
                        Manage your organization's projects.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setEditingProject(null)
                        setErrorMessage(null)
                        setIsFormOpen(true)
                    }}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                    Add Project
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

            {isFormOpen && (
                <ProjectForm
                    clients={clients}
                    initialData={
                        editingProject
                            ? {
                                clientId: editingProject.clientId,
                                name: editingProject.name,
                                description: editingProject.description,
                                status: editingProject.status,
                                startDate: editingProject.startDate,
                                dueDate: editingProject.dueDate,
                            }
                            : undefined
                    }
                    submitLabel={
                        editingProject
                            ? 'Save Changes'
                            : 'Add Project'
                    }
                    onSubmit={handleSubmitProject}
                    onCancel={() => {
                        setIsFormOpen(false)
                        setEditingProject(null)
                        setErrorMessage(null)
                    }}
                />
            )}

            <ProjectFilters
                filters={filters}
                clients={clients}
                onChange={setFilters}
            />

            <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
                <div className="min-w-[900px]">
                    <div className="grid grid-cols-[2fr_1.4fr_1.2fr_1fr_1fr_140px] border-b bg-gray-50 px-6 py-3 text-sm font-medium text-gray-600">
                        <span>Project</span>
                        <span>Client</span>
                        <span>Status</span>
                        <span>Start Date</span>
                        <span>Due Date</span>
                        <span className="text-right">
                            Actions
                        </span>
                    </div>

                    {filteredProjects.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-sm font-medium text-gray-900">
                                {hasActiveFilters
                                    ? 'No projects match your filters'
                                    : 'No projects yet'}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                {hasActiveFilters
                                    ? 'Try adjusting your filters.'
                                    : 'Create your first project to get started.'}
                            </p>

                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFilters({
                                            search: '',
                                            status: '',
                                            clientId: '',
                                        })
                                    }
                                    className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                            filteredProjects.map((project) => {
                                const client = clients.find(
                                    (item) => item.id === project.clientId,
                                )

                                return (
                                    <div
                                        key={project.id}
                                        className="grid grid-cols-[2fr_1.4fr_1.2fr_1fr_1fr_140px] items-center border-b px-6 py-4 text-sm last:border-b-0"
                                    >
                                        <span className="min-w-0 truncate font-medium text-gray-900">
                                            {project.name}
                                        </span>

                                        <span className="min-w-0 truncate text-gray-600">
                                            {client?.name ?? 'Unknown client'}
                                        </span>

                                        <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium ${getProjectStatusClassName(
                                                project.status
                                            )}`}
                                        >
                                            {getProjectStatusLabel(project.status)}
                                        </span>

                                        <span className="text-gray-600">
                                            {formatDate(project.startDate)}
                                        </span>

                                        <span className="text-gray-600">
                                            {formatDate(project.dueDate)}
                                        </span>

                                        <div className="flex min-w-[140px] justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingProject(project)
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
                                                    handleDeleteProject(project.id)
                                                }
                                                className="text-sm font-medium text-danger-600 hover:text-danger-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )
                            }
                        )
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProjectsPage