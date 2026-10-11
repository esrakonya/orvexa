package com.orvexa.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Entity
@Table(name = "workspace_invitations")
public class WorkspaceInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "invited_by_membership_id",
        referencedColumnName = "id",
        nullable = false
    )
    private WorkspaceMembership invitedByMembership;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(nullable = false, length = 30)
    private String role;

    @Column(name = "token_hash", nullable = false, unique = true, length = 255)
    private String tokenHash;

    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "accepted_at")
    private Instant acceptedAt;

    protected WorkspaceInvitation() {
        // JPA requires a no-argument constructor.
    }

    public WorkspaceInvitation(
            Workspace workspace,
            WorkspaceMembership invitedByMembership,
            String email,
            String role,
            String tokenHash,
            Instant expiresAt
    ) {
        this.workspace = workspace;
        this.invitedByMembership = invitedByMembership;
        this.email = normalizeEmail(email);
        this.role = role;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
    }

    private static String normalizeEmail(String email) {
        if (email == null) {
            throw new IllegalArgumentException("Email cannot be null.");
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }

    @PrePersist
    protected void onCreate() {
        this.email = normalizeEmail(this.email);
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public Workspace getWorkspace() {
        return workspace;
    }

    public WorkspaceMembership getInvitedByMembership() {
        return invitedByMembership;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public String getStatus() {
        return status;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getAcceptedAt() {
        return acceptedAt;
    }

    public void accept() {
        if (!"PENDING".equals(this.status)) {
            throw new IllegalStateException(
                "Only pending invitations can be accepted."
            );
        }

        this.status = "ACCEPTED";
        this.acceptedAt = Instant.now();
    }

    public void revoke() {
        if (!"PENDING".equals(this.status)) {
            throw new IllegalStateException(
                "Only pending invitations can be revoked."
            );
        }

        this.status = "REVOKED";
    }

    public void expire() {
        if (!"PENDING".equals(this.status)) {
            throw new IllegalStateException(
                "Only pending invitations can expire."
            );
        }

        this.status = "EXPIRED";
    }
}