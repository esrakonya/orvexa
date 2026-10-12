package com.orvexa.backend.dto.workspace;

import jakarta.validation.constraints.NotBlank;

public record AcceptWorkspaceInvitationRequest(
    @NotBlank(message = "Invitation token is required.")
    String token
) {}