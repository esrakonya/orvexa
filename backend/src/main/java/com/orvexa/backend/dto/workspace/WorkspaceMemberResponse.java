package com.orvexa.backend.dto.workspace;

import com.orvexa.backend.entity.WorkspaceMembership;

import java.util.UUID;

public record WorkspaceMemberResponse(
        UUID id,
        UUID workspaceId,
        String name,
        String email,
        String role
) {
    public static WorkspaceMemberResponse from(
            WorkspaceMembership membership
    ) {
        return new WorkspaceMemberResponse(
                membership.getId(),
                membership.getWorkspace().getId(),
                membership.getUser().getName(),
                membership.getUser().getEmail(),
                membership.getRole()
        );
    }
}