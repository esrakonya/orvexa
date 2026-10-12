import { useState, useEffect } from 'react'
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
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoadingProjects, setIsLoadingProjects] = useState(true)
    const [projectLoadError, setProjectLoadError] = useState<string | null>(
        null,
    )

    const [clients, setClients] = useState<
        { id: string; name: string }[]
    >([])
    const [isLoadingClients, setIsLoadingClients] = useState(true)
    const [clientLoadError, setClientLoadError] = useState<string | null>(
        null,
    )

    const [filters, setFilters] = useState<ProjectFiltersState>({
        search: '',
        status: '',
        clientId: '',
    })

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(
        null,
    )
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
        null,
    )

    useEffect(() => {
        let isMounted = true

        async function loadProjects() {
            try {
                const result = await getAllProjects()

                if (isMounted) {
                    setProjects(result)
                    setProjectLoadError(null)
                }
            } catch (error: unknown) {
                if (isMounted) {
                    setProjectLoadError(
                        error instanceof Error
                            ? error.message
                            : 'Could not load projects.',
                    )
                }
            } finally {
                if (isMounted) {
                    setIsLoadingProjects(false)
                }
            }
        }

        void loadProjects()

        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        let isMounted = true

        async function loadClients() {
            try {
                const result = await getAllClients()

                if (isMounted) {
                    setClients(result)
                    setClientLoadError(null)
                }
            } catch (error: unknown) {
                if (isMounted) {
                    setClientLoadError(
                        error instanceof Error
                            ? error.message
                            : 'Could not load clients.',
                    )
                }
            } finally {
                if (isMounted) {
                    setIsLoadingClients(false)
                }
            }
        }

        void loadClients()

        return () => {
            isMounted = false
        }
    }, [])

    const handleSubmitProject = async (
        formData: ProjectFormData,
    ): Promise<void> => {
        if (isSubmitting) {
            return
        }

        setIsSubmitting(true)
        setErrorMessage(null)

        try {
            if (editingProject) {
                const updatedProject = await updateProject(
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
            } else {
                const newProject = await createProject(formData)

                setProjects((current) => [
                    ...current,
                    newProject,
                ])
            }

            setEditingProject(null)
            setIsFormOpen(false)
        } catch (error: unknown) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred.',
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteProject = async (
        projectId: string,
    ): Promise<void> => {
        if (deletingProjectId !== null) {
            return
        }

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

        setDeletingProjectId(projectId)
        setErrorMessage(null)

        try {
            await deleteProject(projectId)

            setProjects((current) =>
                current.filter((item) => item.id !== projectId),
            )

            if (editingProject?.id === projectId) {
                setEditingProject(null)
                setIsFormOpen(false)
            }
        } catch (error: unknown) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred.',
            )
        } finally {
            setDeletingProjectId(null)
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
        status: ProjectStatus,
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
            PLANNING: 'bg-planning-50 text-planning-700',
            IN_PROGRESS: 'bg-info-50 text-info-700',
            ON_HOLD: 'bg-warning-50 text-warning-700',
            COMPLETED: 'bg-success-50 text-success-700',
        }

        return classes[status]
    }

    const hasActiveFilters =
        filters.search.trim() !== '' ||
        filters.status !== '' ||
        filters.clientId !== ''

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-forest">
                        Projects
                    </h1>

                    <p className="mt-1 text-sm text-sage">
                        Manage your organization's projects.
                    </p>
                </div>

                <button
                    type="button"
                    disabled={isLoadingClients || clients.length === 0}
                    onClick={() => {
                        setEditingProject(null)
                        setErrorMessage(null)
                        setIsFormOpen(true)
                    }}
                    className="rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
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

            {projectLoadError && (
                <div
                    role="alert"
                    className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    Could not load projects: {projectLoadError}
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="ml-2 font-medium underline"
                    >
                        Reload
                    </button>
                </div>
            )}

            {isFormOpen && (
                isLoadingClients ? (
                    <p className="mt-6 text-sm text-sage">
                        Loading clients...
                    </p>
                ) : clientLoadError ? (
                    <div
                        role="alert"
                        className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        Could not load clients: {clientLoadError}
                    </div>
                ) : clients.length === 0 ? (
                    <p className="mt-6 text-sm text-sage">
                        Create a client before adding a project.
                    </p>
                ) : (
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
                            editingProject ? 'Save Changes' : 'Add Project'
                        }
                        onSubmit={handleSubmitProject}
                        onCancel={() => {
                            setIsFormOpen(false)
                            setEditingProject(null)
                            setErrorMessage(null)
                        }}
                    />
                )
            )}

            <ProjectFilters
                filters={filters}
                clients={clients}
                onChange={setFilters}
            />

            <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
                <div className="min-w-[900px]">
                    <div className="grid grid-cols-[2fr_1.4fr_1.2fr_1fr_1fr_140px] border-b bg-ivory px-6 py-3 text-sm font-medium text-sage">
                        <span>Project</span>
                        <span>Client</span>
                        <span>Status</span>
                        <span>Start Date</span>
                        <span>Due Date</span>
                        <span className="text-right">Actions</span>
                    </div>

                    {isLoadingProjects ? (
                        <div className="px-6 py-12 text-center text-sm text-sage">
                            Loading projects...
                        </div>
                    ) : projectLoadError ? (
                        <div className="px-6 py-12 text-center text-sm text-sage">
                            Projects could not be displayed. Check the error above.
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-sm font-medium text-forest">
                                {hasActiveFilters
                                    ? 'No projects match your filters'
                                    : 'No projects yet'}
                            </p>

                            <p className="mt-1 text-sm text-sage">
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
                                    className="mt-4 text-sm font-medium text-forest hover:text-sage"
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
                                    <span className="min-w-0 truncate font-medium text-forest">
                                        {project.name}
                                    </span>

                                    <span className="min-w-0 truncate text-sage">
                                        {client?.name ?? 'Unknown client'}
                                    </span>

                                    <span
                                        className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium ${getProjectStatusClassName(
                                            project.status,
                                        )}`}
                                    >
                                        {getProjectStatusLabel(project.status)}
                                    </span>

                                    <span className="text-sage">
                                        {formatDate(project.startDate)}
                                    </span>

                                    <span className="text-sage">
                                        {formatDate(project.dueDate)}
                                    </span>

                                    <div className="flex min-w-[140px] justify-end gap-3">
                                        <button
                                            type="button"
                                            disabled={deletingProjectId !== null || isSubmitting}
                                            onClick={() => {
                                                setEditingProject(project)
                                                setErrorMessage(null)
                                                setIsFormOpen(true)
                                            }}
                                            className="text-sm font-medium text-sage hover:text-forest disabled:opacity-50"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            disabled={deletingProjectId !== null || isSubmitting}
                                            onClick={() => {
                                                void handleDeleteProject(project.id)
                                            }}
                                            className="text-sm font-medium text-danger-600 hover:text-danger-700 disabled:opacity-50"
                                        >
                                            {deletingProjectId === project.id
                                                ? 'Deleting...'
                                                : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {isSubmitting && (
                <p className="mt-3 text-sm text-sage">
                    Saving project...
                </p>
            )}
        </div>
    )

}

export default ProjectsPage