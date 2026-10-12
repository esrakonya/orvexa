package com.orvexa.backend.dto.workspace;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterWorkspaceInvitationRequest(
        @NotBlank(message = "Invitation token is required.")
        String token,

        @NotBlank(message = "Name is required.")
        @Size(max = 100, message = "Name must not exceed 100 characters.")
        String name,

        @NotBlank(message = "Password is required.")
        @Size(min = 12, max = 72, message = "Password must be between 12 and 72 characters.")
        String password
) {}