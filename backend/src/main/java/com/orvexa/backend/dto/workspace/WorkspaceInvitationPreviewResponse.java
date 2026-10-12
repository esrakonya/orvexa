package com.orvexa.backend.dto.workspace;

import java.time.Instant;

public record WorkspaceInvitationPreviewResponse(
        String workspaceName,
        String email,
        String role,
        Instant expiresAt
) {
}