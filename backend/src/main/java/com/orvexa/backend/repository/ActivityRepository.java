package com.orvexa.backend.repository;

import com.orvexa.backend.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ActivityRepository extends JpaRepository<Activity, UUID> {

    List<Activity> findAllByWorkspaceIdOrderByCreatedAtDesc(
            UUID workspaceId
    );

    List<Activity> findAllByWorkspaceIdAndEntityTypeAndEntityIdOrderByCreatedAtDesc(
            UUID workspaceId,
            String entityType,
            UUID entityId
    );
}