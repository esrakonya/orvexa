package com.orvexa.backend.service;

import com.orvexa.backend.dto.workspace.CreateWorkspaceInvitationRequest;
import com.orvexa.backend.dto.workspace.WorkspaceInvitationCreatedResponse;
import com.orvexa.backend.dto.workspace.WorkspaceInvitationPreviewResponse;
import com.orvexa.backend.dto.workspace.AcceptWorkspaceInvitationRequest;
import com.orvexa.backend.dto.workspace.RegisterWorkspaceInvitationRequest;
import com.orvexa.backend.entity.WorkspaceInvitation;
import com.orvexa.backend.entity.WorkspaceMembership;
import com.orvexa.backend.entity.User;
import com.orvexa.backend.repository.UserRepository;
import com.orvexa.backend.repository.WorkspaceInvitationRepository;
import com.orvexa.backend.repository.WorkspaceMembershipRepository;
import com.orvexa.backend.security.CustomUserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class WorkspaceInvitationService {

    private static final String ADMIN = "ADMIN";
    private static final String PENDING = "PENDING";
    private static final int INVITATION_VALIDITY_DAYS = 7;

    private final WorkspaceInvitationRepository invitationRepository;
    private final WorkspaceMembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final InvitationTokenService tokenService;
    private final PasswordEncoder passwordEncoder;

    public WorkspaceInvitationService(
            WorkspaceInvitationRepository invitationRepository,
            WorkspaceMembershipRepository membershipRepository,
            UserRepository userRepository,
            InvitationTokenService tokenService,
            PasswordEncoder passwordEncoder
    ) {
        this.invitationRepository = invitationRepository;
        this.membershipRepository = membershipRepository;
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public WorkspaceInvitationCreatedResponse createInvitation(
            CustomUserDetails currentUser,
            CreateWorkspaceInvitationRequest request
    ) {
        String email = normalizeEmail(request.email());
        String role = request.role().trim();

        WorkspaceMembership inviter = getCurrentMembership(currentUser);

        if (!ADMIN.equals(inviter.getRole())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only workspace administrators can invite members."
            );
        }

        if (inviter.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You are already a member of this workspace."
            );
        }


        Instant now = Instant.now();

        invitationRepository
            .findAllByWorkspace_IdAndStatus(
                    inviter.getWorkspace().getId(),
                    PENDING
            )
            .stream()
            .filter(invitation ->
                    !invitation.getExpiresAt().isAfter(now))
            .filter(invitation ->
                    invitation.getEmail().equalsIgnoreCase(email))
            .forEach(invitation -> {
                invitation.expire();
                invitationRepository.save(invitation);
            });

        if (invitationRepository
                .existsByWorkspace_IdAndEmailIgnoreCaseAndStatus(
                        inviter.getWorkspace().getId(),
                        email,
                        PENDING
                )) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A pending invitation already exists for this email."
            );
        }

        userRepository.findByEmail(email).ifPresent(existingUser -> {
            List<WorkspaceMembership> memberships =
                    membershipRepository.findAllByUser_Id(existingUser.getId());

            if (!memberships.isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "This account already belongs to a workspace."
                );
            }
        });

        String token = tokenService.generateToken();
        String tokenHash = tokenService.hashToken(token);
        Instant expiresAt = Instant.now().plus(
                INVITATION_VALIDITY_DAYS,
                ChronoUnit.DAYS
        );

        WorkspaceInvitation invitation = new WorkspaceInvitation(
                inviter.getWorkspace(),
                inviter,
                email,
                role,
                tokenHash,
                expiresAt
        );

        invitation = invitationRepository.save(invitation);

        return new WorkspaceInvitationCreatedResponse(
                invitation.getId(),
                invitation.getEmail(),
                invitation.getRole(),
                token,
                invitation.getExpiresAt()
        );
    }


    @Transactional(readOnly = true)
    public WorkspaceInvitationPreviewResponse previewInvitation(String token) {
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invitation token is required."
            );
        }

        String tokenHash = tokenService.hashToken(token);

        WorkspaceInvitation invitation = invitationRepository
                .findByTokenHash(tokenHash)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invitation is invalid or no longer available."
                ));

        if (!"PENDING".equals(invitation.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "This invitation is no longer available."
            );
        }

        if (!invitation.getExpiresAt().isAfter(Instant.now())) {
            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "This invitation has expired."
            );
        }

        return new WorkspaceInvitationPreviewResponse(
                invitation.getWorkspace().getName(),
                invitation.getEmail(),
                invitation.getRole(),
                invitation.getExpiresAt()
        );
    }
    
    @Transactional
    public void acceptInvitation(
            CustomUserDetails currentUser,
            AcceptWorkspaceInvitationRequest request
    ) {
        String tokenHash = tokenService.hashToken(request.token());

        WorkspaceInvitation invitation = invitationRepository
                .findByTokenHashForUpdate(tokenHash)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invitation is invalid or no longer available."
                ));

        if (!"PENDING".equals(invitation.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "This invitation is no longer available."
            );
        }

        if (!invitation.getExpiresAt().isAfter(Instant.now())) {
            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "This invitation has expired."
            );
        }

        String userEmail = normalizeEmail(currentUser.getUsername());
        String invitationEmail = normalizeEmail(invitation.getEmail());

        if (!userEmail.equals(invitationEmail)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "This invitation belongs to a different email address."
            );
        }

        List<WorkspaceMembership> memberships =
                membershipRepository.findAllByUser_Id(currentUser.getId());

        if (!memberships.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This account already belongs to a workspace."
            );
        }

        User user = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User account was not found."
                ));

        WorkspaceMembership newMembership = new WorkspaceMembership(
                invitation.getWorkspace(),
                user,
                invitation.getRole()
        );

        membershipRepository.save(newMembership);

        invitation.accept();
        invitationRepository.save(invitation);
    }


    @Transactional
    public void registerAndAcceptInvitation(
            RegisterWorkspaceInvitationRequest request
    ) {
        String tokenHash = tokenService.hashToken(request.token());

        WorkspaceInvitation invitation = invitationRepository
                .findByTokenHashForUpdate(tokenHash)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invitation is invalid or no longer available."
                ));

        if (!"PENDING".equals(invitation.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "This invitation is no longer available."
            );
        }

        if (!invitation.getExpiresAt().isAfter(Instant.now())) {
            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "This invitation has expired."
            );
        }

        String email = normalizeEmail(invitation.getEmail());
        String name = request.name().trim();
        String password = request.password();

        if (name.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Name must not be blank."
            );
        }

        if (password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password must not exceed 72 UTF-8 bytes."
            );
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An account with this email already exists. Please log in instead."
            );
        }

        User user = userRepository.save(
                new User(name, email, passwordEncoder.encode(password))
        );

        WorkspaceMembership membership = new WorkspaceMembership(
                invitation.getWorkspace(),
                user,
                invitation.getRole()
        );

        membershipRepository.save(membership);

        invitation.accept();
        invitationRepository.save(invitation);
    }

    private WorkspaceMembership getCurrentMembership(
            CustomUserDetails currentUser
    ) {
        List<WorkspaceMembership> memberships =
                membershipRepository.findAllByUser_Id(currentUser.getId());

        if (memberships.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not belong to a workspace."
            );
        }

        if (memberships.size() > 1) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Multiple workspaces exist, but no active workspace is selected."
            );
        }

        return memberships.get(0);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}