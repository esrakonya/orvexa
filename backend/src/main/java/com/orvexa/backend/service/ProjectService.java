package com.orvexa.backend.service;

import com.orvexa.backend.dto.project.CreateProjectRequest;
import com.orvexa.backend.dto.project.ProjectResponse;
import com.orvexa.backend.dto.project.UpdateProjectRequest;
import com.orvexa.backend.entity.Project;
import com.orvexa.backend.entity.WorkspaceMembership;
import com.orvexa.backend.repository.ClientRepository;
import com.orvexa.backend.repository.ProjectRepository;
import com.orvexa.backend.repository.TaskRepository;
import com.orvexa.backend.repository.WorkspaceMembershipRepository;
import com.orvexa.backend.service.ActivityService;
import com.orvexa.backend.security.CustomUserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final TaskRepository taskRepository;
    private final WorkspaceMembershipRepository membershipRepository;
    private final ActivityService activityService;

    public ProjectService(
            ProjectRepository projectRepository,
            ClientRepository clientRepository,
            TaskRepository taskRepository,
            WorkspaceMembershipRepository membershipRepository,
            ActivityService activityService
    ) {
        this.projectRepository = projectRepository;
        this.clientRepository = clientRepository;
        this.taskRepository = taskRepository;
        this.membershipRepository = membershipRepository;
        this.activityService = activityService;
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjects(CustomUserDetails user) {
        UUID workspaceId = getWorkspaceId(user);

        return projectRepository.findAllByWorkspaceId(workspaceId)
                .stream()
                .map(ProjectResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(UUID projectId, CustomUserDetails user) {
        UUID workspaceId = getWorkspaceId(user);

        return ProjectResponse.from(findProject(projectId, workspaceId));
    }


    public ProjectResponse createProject(
            CreateProjectRequest request,
            CustomUserDetails user
    ) {
        UUID workspaceId = getWorkspaceId(user);

        clientRepository.findByIdAndWorkspaceId(
                request.clientId(),
                workspaceId
        ).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Client not found."
        ));

        validateDates(request.startDate(), request.dueDate());

        Project project = new Project(
                workspaceId,
                request.clientId(),
                request.name().trim(),
                request.description(),
                request.startDate(),
                request.dueDate()
        );

        if (request.status() != null) {
            project.setStatus(request.status());
        }

        validateCompletion(project, workspaceId);

        Project savedProject = projectRepository.save(project);

        activityService.recordActivity(
                user,
                "CREATED",
                "PROJECT",
                savedProject.getId(),
                "created a project: " + savedProject.getName()
        );

        return ProjectResponse.from(savedProject);
    }

    public ProjectResponse updateProject(
            UUID projectId,
            UpdateProjectRequest request,
            CustomUserDetails user
    ) {
        UUID workspaceId = getWorkspaceId(user);
        Project project = findProject(projectId, workspaceId);

        if (request.clientId() != null) {
            clientRepository.findByIdAndWorkspaceId(
                    request.clientId(),
                    workspaceId
            ).orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Client not found."
            ));

            project.setClientId(request.clientId());
        }

        if (request.name() != null) {
            project.setName(request.name().trim());
        }

        if (request.description() != null) {
            project.setDescription(request.description());
        }

        if (request.status() != null) {
            project.setStatus(request.status());
        }

        if (request.startDate() != null) {
            project.setStartDate(request.startDate());
        }

        if (request.dueDate() != null) {
            project.setDueDate(request.dueDate());
        }

        validateDates(project.getStartDate(), project.getDueDate());
        if ("COMPLETED".equals(project.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A new project cannot be completed before its tasks are created."
            );
        }

        Project updatedProject = projectRepository.save(project);

        activityService.recordActivity(
                user,
                "UPDATED",
                "PROJECT",
                updatedProject.getId(),
                "updated a project: " + updatedProject.getName()
        );

        return ProjectResponse.from(updatedProject);
    }


    public void deleteProject(UUID projectId, CustomUserDetails user) {
        UUID workspaceId = getWorkspaceId(user);
        Project project = findProject(projectId, workspaceId);

        if (taskRepository.existsByProjectIdAndWorkspaceId(
                projectId,
                workspaceId
        )) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete a project that has associated tasks."
            );
        }

        activityService.recordActivity(
                user,
                "DELETED",
                "PROJECT",
                project.getId(),
                "deleted a project: " + project.getName()
        );

        projectRepository.delete(project);
    }

    private Project findProject(UUID projectId, UUID workspaceId) {
        return projectRepository.findByIdAndWorkspaceId(
                projectId,
                workspaceId
        ).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Project not found."
        ));
    }

    private UUID getWorkspaceId(CustomUserDetails user) {
        List<WorkspaceMembership> memberships =
                membershipRepository.findAllByUser_Id(user.getId());

        if (memberships.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not belong to a workspace."
            );
        }

        if (memberships.size() > 1) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Multiple workspaces exist, but no active workspace is selected."
            );
        }

        return memberships.get(0).getWorkspace().getId();
    }

    private void validateDates(
            java.time.LocalDate startDate,
            java.time.LocalDate dueDate
    ) {
        if (dueDate.isBefore(startDate)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Project due date cannot be earlier than the start date."
            );
        }
    }

    private void validateCompletion(Project project, UUID workspaceId) {
        if ("COMPLETED".equals(project.getStatus())
                && taskRepository.existsByProjectIdAndWorkspaceIdAndStatusNot(
                        project.getId(),
                        workspaceId,
                        "COMPLETED"
                )) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot complete a project while it has incomplete tasks."
            );
        }
    }
}