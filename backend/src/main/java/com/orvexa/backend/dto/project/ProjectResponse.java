package com.orvexa.backend.dto.project;

import com.orvexa.backend.entity.Project;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ProjectResponse(
        UUID id,
        UUID workspaceId,
        UUID clientId,
        String name,
        String description,
        String status,
        LocalDate startDate,
        LocalDate dueDate,
        Instant createdAt,
        Instant updatedAt
) {
    public static ProjectResponse from(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getWorkspaceId(),
                project.getClientId(),
                project.getName(),
                project.getDescription(),
                project.getStatus(),
                project.getStartDate(),
                project.getDueDate(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}