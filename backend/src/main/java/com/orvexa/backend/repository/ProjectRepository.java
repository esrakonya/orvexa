package com.orvexa.backend.repository;

import com.orvexa.backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {

    List<Project> findAllByWorkspaceId(UUID workspaceId);

    Optional<Project> findByIdAndWorkspaceId(
            UUID id,
            UUID workspaceId
    );

    boolean existsByClientIdAndWorkspaceId(
            UUID clientId,
            UUID workspaceId
    );

    boolean existsByIdAndWorkspaceId(
            UUID id,
            UUID workspaceId
    );
}