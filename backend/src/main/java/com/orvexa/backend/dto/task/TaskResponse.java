package com.orvexa.backend.dto.task;

import com.orvexa.backend.entity.Task;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        UUID workspaceId,
        UUID projectId,
        UUID assigneeId,
        String title,
        String description,
        String status,
        String priority,
        LocalDate dueDate,
        Instant createdAt,
        Instant updatedAt
) {
    public static TaskResponse from(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getWorkspaceId(),
                task.getProjectId(),
                task.getAssigneeMembershipId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}