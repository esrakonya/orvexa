package com.orvexa.backend.repository;

import com.orvexa.backend.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findAllByWorkspaceId(UUID workspaceId);

    List<Task> findAllByProjectIdAndWorkspaceId(
            UUID projectId,
            UUID workspaceId
    );

    Optional<Task> findByIdAndWorkspaceId(
            UUID id,
            UUID workspaceId
    );

    boolean existsByProjectIdAndWorkspaceIdAndStatusNot(
            UUID projectId,
            UUID workspaceId,
            String status
    );

    boolean existsByAssigneeMembershipIdAndWorkspaceId(
            UUID assigneeMembershipId,
            UUID workspaceId
    );
}