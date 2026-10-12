package com.orvexa.backend.dto.project;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record CreateProjectRequest(

        @NotNull(message = "Client is required.")
        UUID clientId,

        @NotBlank(message = "Project name is required.")
        @Size(max = 150, message = "Project name must not exceed 150 characters.")
        String name,

        @NotNull(message = "Project description is required.")
        String description,

        @Pattern(
                regexp = "PLANNING|IN_PROGRESS|ON_HOLD|COMPLETED",
                message = "Invalid project status."
        )
        String status,

        @NotNull(message = "Start date is required.")
        LocalDate startDate,

        @NotNull(message = "Due date is required.")
        LocalDate dueDate
) {
}