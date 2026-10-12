package com.orvexa.backend.controller;

import com.orvexa.backend.dto.workspace.WorkspaceMemberResponse;
import com.orvexa.backend.security.CustomUserDetails;
import com.orvexa.backend.service.WorkspaceMembershipService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/workspace-members")
public class WorkspaceMembershipController {

    private final WorkspaceMembershipService membershipService;

    public WorkspaceMembershipController(
            WorkspaceMembershipService membershipService
    ) {
        this.membershipService = membershipService;
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceMemberResponse>> getWorkspaceMembers(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                membershipService.getWorkspaceMembers(user)
        );
    }
}