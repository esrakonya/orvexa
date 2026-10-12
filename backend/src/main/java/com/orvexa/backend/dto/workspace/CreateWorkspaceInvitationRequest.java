package com.orvexa.backend.dto.workspace;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateWorkspaceInvitationRequest(

        @NotBlank(message = "Email is required.")
        @Email(message = "Email must be valid.")
        @Size(max = 255, message = "Email must not exceed 255 characters.")
        String email,

        @NotBlank(message = "Role is required.")
        @Pattern(
                regexp = "ADMIN|PROJECT_MANAGER|MEMBER",
                message = "Role must be ADMIN, PROJECT_MANAGER, or MEMBER."
        )
        String role

) {
}