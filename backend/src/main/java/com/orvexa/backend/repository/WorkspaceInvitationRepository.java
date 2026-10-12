package com.orvexa.backend.repository;

import com.orvexa.backend.entity.WorkspaceInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkspaceInvitationRepository
        extends JpaRepository<WorkspaceInvitation, UUID> {

    Optional<WorkspaceInvitation> findByTokenHash(String tokenHash);

    List<WorkspaceInvitation> findAllByWorkspace_IdAndStatus(
        UUID workspaceId,
        String status
    );

    boolean existsByWorkspace_IdAndEmailIgnoreCaseAndStatus(
        UUID workspaceId,
        String email,
        String status
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT invitation
        FROM WorkspaceInvitation invitation
        WHERE invitation.tokenHash = :tokenHash
        """)
    Optional<WorkspaceInvitation> findByTokenHashForUpdate(
        @Param("tokenHash") String tokenHash
    );
}