package com.orvexa.backend.dto.project;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record UpdateProjectRequest(

        UUID clientId,

        @Pattern(
                regexp = ".*\\S.*",
                message = "Project name must not be blank."
        )
        @Size(max = 150, message = "Project name must not exceed 150 characters.")
        String name,

        String description,

        @Pattern(
                regexp = "PLANNING|IN_PROGRESS|ON_HOLD|COMPLETED",
                message = "Invalid project status."
        )
        String status,

        LocalDate startDate,

        LocalDate dueDate
) {
}