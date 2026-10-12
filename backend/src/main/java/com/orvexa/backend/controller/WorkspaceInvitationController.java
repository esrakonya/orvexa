package com.orvexa.backend.controller;

import com.orvexa.backend.dto.workspace.CreateWorkspaceInvitationRequest;
import com.orvexa.backend.dto.workspace.WorkspaceInvitationCreatedResponse;
import com.orvexa.backend.dto.workspace.AcceptWorkspaceInvitationRequest;
import com.orvexa.backend.dto.workspace.RegisterWorkspaceInvitationRequest;
import com.orvexa.backend.security.CustomUserDetails;
import com.orvexa.backend.service.WorkspaceInvitationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/workspace-invitations")
public class WorkspaceInvitationController {

    private final WorkspaceInvitationService invitationService;

    public WorkspaceInvitationController(
            WorkspaceInvitationService invitationService
    ) {
        this.invitationService = invitationService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkspaceInvitationCreatedResponse createInvitation(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody CreateWorkspaceInvitationRequest request
    ) {
        return invitationService.createInvitation(currentUser, request);
    }


    @GetMapping("/preview")
    public com.orvexa.backend.dto.workspace.WorkspaceInvitationPreviewResponse
    previewInvitation(
            @RequestParam String token
    ) {
        return invitationService.previewInvitation(token);
    }


    @PostMapping("/accept")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void acceptInvitation(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody AcceptWorkspaceInvitationRequest request
    ) {
        invitationService.acceptInvitation(currentUser, request);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void registerAndAcceptInvitation(
            @Valid @RequestBody RegisterWorkspaceInvitationRequest request
    ) {
        invitationService.registerAndAcceptInvitation(request);
    }
}