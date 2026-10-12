package com.orvexa.backend.dto.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record CreateTaskRequest(

        @NotNull(message = "Project is required.")
        UUID projectId,

        @NotNull(message = "Assignee is required.")
        UUID assigneeId,

        @NotBlank(message = "Task title is required.")
        @Size(max = 200, message = "Task title must not exceed 200 characters.")
        String title,

        @NotNull(message = "Task description is required.")
        String description,

        @NotNull(message = "Task status is required.")
        @Pattern(
                regexp = "TODO|IN_PROGRESS|COMPLETED",
                message = "Invalid task status."
        )
        String status,

        @NotNull(message = "Task priority is required.")
        @Pattern(
                regexp = "LOW|MEDIUM|HIGH",
                message = "Invalid task priority."
        )
        String priority,

        @NotNull(message = "Due date is required.")
        LocalDate dueDate
) {
}