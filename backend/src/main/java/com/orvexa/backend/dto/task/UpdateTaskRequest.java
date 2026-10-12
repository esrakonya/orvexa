package com.orvexa.backend.dto.task;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record UpdateTaskRequest(

        UUID projectId,

        UUID assigneeId,

        @Pattern(
                regexp = ".*\\S.*",
                message = "Task title must not be blank."
        )
        @Size(max = 200, message = "Task title must not exceed 200 characters.")
        String title,

        String description,

        @Pattern(
                regexp = "TODO|IN_PROGRESS|COMPLETED",
                message = "Invalid task status."
        )
        String status,

        @Pattern(
                regexp = "LOW|MEDIUM|HIGH",
                message = "Invalid task priority."
        )
        String priority,

        LocalDate dueDate
) {
}