package com.orvexa.backend.dto.workspace;

import java.time.Instant;
import java.util.UUID;

public record WorkspaceInvitationCreatedResponse(
        UUID id,
        String email,
        String role,
        String token,
        Instant expiresAt
) {
}