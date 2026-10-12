package com.orvexa.backend.service;

import com.orvexa.backend.dto.task.CreateTaskRequest;
import com.orvexa.backend.dto.task.TaskResponse;
import com.orvexa.backend.dto.task.UpdateTaskRequest;
import com.orvexa.backend.entity.Project;
import com.orvexa.backend.entity.Task;
import com.orvexa.backend.entity.WorkspaceMembership;
import com.orvexa.backend.repository.ProjectRepository;
import com.orvexa.backend.repository.TaskRepository;
import com.orvexa.backend.repository.WorkspaceMembershipRepository;
import com.orvexa.backend.service.ActivityService;
import com.orvexa.backend.security.CustomUserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final WorkspaceMembershipRepository membershipRepository;
    private final ActivityService activityService;

    public TaskService(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            WorkspaceMembershipRepository membershipRepository,
            ActivityService activityService
    ) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.membershipRepository = membershipRepository;
        this.activityService = activityService;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasks(CustomUserDetails user) {
        UUID workspaceId = getWorkspaceId(user);

        return taskRepository.findAllByWorkspaceId(workspaceId)
                .stream()
                .map(TaskResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(
            UUID taskId,
            CustomUserDetails user
    ) {
        UUID workspaceId = getWorkspaceId(user);

        return TaskResponse.from(findTask(taskId, workspaceId));
    }


    public TaskResponse createTask(
            CreateTaskRequest request,
            CustomUserDetails user
    ) {
        UUID workspaceId = getWorkspaceId(user);

        Project project = findProject(
                request.projectId(),
                workspaceId
        );

        validateProjectForCreation(project);
        validateDueDate(request.dueDate(), project.getDueDate());

        WorkspaceMembership assignee = findMembership(
                request.assigneeId(),
                workspaceId
        );

        String title = request.title().trim();

        Task task = new Task(
                workspaceId,
                project.getId(),
                assignee.getId(),
                title,
                request.description(),
                request.priority(),
                request.dueDate()
        );

        task.setStatus(request.status());

        Task savedTask = taskRepository.save(task);

        activityService.recordActivity(
                user,
                "CREATED",
                "TASK",
                savedTask.getId(),
                "created a task: " + savedTask.getTitle()
        );

        return TaskResponse.from(savedTask);
    }

    public TaskResponse updateTask(
            UUID taskId,
            UpdateTaskRequest request,
            CustomUserDetails user
    ) {
        UUID workspaceId = getWorkspaceId(user);

        Task task = findTask(taskId, workspaceId);
        String previousStatus = task.getStatus();

        UUID projectId = request.projectId() != null
                ? request.projectId()
                : task.getProjectId();

        UUID assigneeId = request.assigneeId() != null
                ? request.assigneeId()
                : task.getAssigneeMembershipId();

        Project project = findProject(projectId, workspaceId);

        WorkspaceMembership assignee = findMembership(
                assigneeId,
                workspaceId
        );

        LocalDate dueDate = request.dueDate() != null
                ? request.dueDate()
                : task.getDueDate();

        validateDueDate(dueDate, project.getDueDate());

        if ("COMPLETED".equals(project.getStatus())
                && (!projectId.equals(task.getProjectId())
                || (request.status() != null
                && !"COMPLETED".equals(request.status())))) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot move a task to a completed project or reopen its task."
            );
        }

        if (request.title() != null) {
            task.setTitle(request.title().trim());
        }

        if (request.description() != null) {
            task.setDescription(request.description());
        }

        if (request.status() != null) {
            task.setStatus(request.status());
        }

        if (request.priority() != null) {
            task.setPriority(request.priority());
        }

        if (request.dueDate() != null) {
            task.setDueDate(request.dueDate());
        }

        task.setProjectId(project.getId());
        task.setAssigneeMembershipId(assignee.getId());


        Task updatedTask = taskRepository.save(task);

        boolean newlyCompleted =
                !"COMPLETED".equals(previousStatus)
                && "COMPLETED".equals(updatedTask.getStatus());

        String activityType = newlyCompleted
                ? "COMPLETED"
                : "UPDATED";

        String description = newlyCompleted
                ? "completed a task: " + updatedTask.getTitle()
                : "updated a task: " + updatedTask.getTitle();

        activityService.recordActivity(
                user,
                activityType,
                "TASK",
                updatedTask.getId(),
                description
        );

        return TaskResponse.from(updatedTask);

    }

    public void deleteTask(
            UUID taskId,
            CustomUserDetails user
    ) {
        UUID workspaceId = getWorkspaceId(user);
        Task task = findTask(taskId, workspaceId);

        activityService.recordActivity(
                user,
                "DELETED",
                "TASK",
                task.getId(),
                "deleted a task: " + task.getTitle()
        );

        taskRepository.delete(task);
    }

    private Task findTask(UUID taskId, UUID workspaceId) {
        return taskRepository.findByIdAndWorkspaceId(
                taskId,
                workspaceId
        ).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Task not found."
        ));
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

    private WorkspaceMembership findMembership(
            UUID membershipId,
            UUID workspaceId
    ) {
        return membershipRepository.findAllByWorkspace_Id(workspaceId)
                .stream()
                .filter(membership -> membership.getId().equals(membershipId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Assignee not found in this workspace."
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

    private void validateProjectForCreation(Project project) {
        if ("COMPLETED".equals(project.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot create a task for a completed project."
            );
        }
    }

    private void validateDueDate(
            LocalDate taskDueDate,
            LocalDate projectDueDate
    ) {
        if (taskDueDate.isAfter(projectDueDate)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Task due date cannot be later than the project due date."
            );
        }
    }
}