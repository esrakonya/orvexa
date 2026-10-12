package com.orvexa.backend.repository;

import com.orvexa.backend.entity.WorkspaceMembership;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkspaceMembershipRepository
        extends JpaRepository<WorkspaceMembership, UUID> {

    List<WorkspaceMembership> findAllByUser_Id(UUID userId);

    List<WorkspaceMembership> findAllByWorkspace_Id(UUID workspaceId);

    Optional<WorkspaceMembership> findByWorkspace_IdAndUser_Id(
            UUID workspaceId,
            UUID userId
    );

    boolean existsByWorkspace_IdAndUser_Id(
            UUID workspaceId,
            UUID userId
    );
}