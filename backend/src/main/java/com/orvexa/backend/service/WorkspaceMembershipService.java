package com.orvexa.backend.service;

import com.orvexa.backend.dto.workspace.WorkspaceMemberResponse;
import com.orvexa.backend.entity.WorkspaceMembership;
import com.orvexa.backend.repository.WorkspaceMembershipRepository;
import com.orvexa.backend.security.CustomUserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class WorkspaceMembershipService {

    private final WorkspaceMembershipRepository membershipRepository;

    public WorkspaceMembershipService(
            WorkspaceMembershipRepository membershipRepository
    ) {
        this.membershipRepository = membershipRepository;
    }

    public List<WorkspaceMemberResponse> getWorkspaceMembers(
            CustomUserDetails user
    ) {
        UUID workspaceId = getWorkspaceId(user);

        return membershipRepository.findAllByWorkspace_Id(workspaceId)
                .stream()
                .map(WorkspaceMemberResponse::from)
                .toList();
    }

    private UUID getWorkspaceId(CustomUserDetails user) {
        List<WorkspaceMembership> memberships =
                membershipRepository.findAllByUser_Id(user.getId());

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

        return memberships.get(0).getWorkspace().getId();
    }
}