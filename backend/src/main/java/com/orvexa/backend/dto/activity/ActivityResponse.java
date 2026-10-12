package com.orvexa.backend.dto.activity;

import com.orvexa.backend.entity.Activity;

import java.time.Instant;
import java.util.UUID;

public record ActivityResponse(
        UUID id,
        UUID workspaceId,
        UUID actorMembershipId,
        String type,
        String entityType,
        UUID entityId,
        String description,
        Instant createdAt
) {
    public static ActivityResponse from(Activity activity) {
        return new ActivityResponse(
                activity.getId(),
                activity.getWorkspaceId(),
                activity.getActorMembershipId(),
                activity.getType(),
                activity.getEntityType(),
                activity.getEntityId(),
                activity.getDescription(),
                activity.getCreatedAt()
        );
    }
}