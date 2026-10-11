package com.orvexa.backend.repository;

import com.orvexa.backend.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClientRepository extends JpaRepository<Client, UUID> {

    List<Client> findAllByWorkspaceId(UUID workspaceId);

    Optional<Client> findByIdAndWorkspaceId(
            UUID id,
            UUID workspaceId
    );

    boolean existsByIdAndWorkspaceId(
            UUID id,
            UUID workspaceId
    );
}