package com.orvexa.backend.service;

import com.orvexa.backend.dto.activity.ActivityResponse;
import com.orvexa.backend.entity.Activity;
import com.orvexa.backend.entity.WorkspaceMembership;
import com.orvexa.backend.repository.ActivityRepository;
import com.orvexa.backend.repository.WorkspaceMembershipRepository;
import com.orvexa.backend.security.CustomUserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final WorkspaceMembershipRepository membershipRepository;

    public ActivityService(
            ActivityRepository activityRepository,
            WorkspaceMembershipRepository membershipRepository
    ) {
        this.activityRepository = activityRepository;
        this.membershipRepository = membershipRepository;
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> getAllActivities(CustomUserDetails user) {
        WorkspaceMembership membership = getCurrentMembership(user);
        UUID workspaceId = membership.getWorkspace().getId();

        return activityRepository
                .findAllByWorkspaceIdOrderByCreatedAtDesc(workspaceId)
                .stream()
                .map(ActivityResponse::from)
                .toList();
    }

    @Transactional
    public void recordActivity(
            CustomUserDetails user,
            String type,
            String entityType,
            UUID entityId,
            String description
    ) {
        WorkspaceMembership membership = getCurrentMembership(user);

        Activity activity = new Activity(
                membership.getWorkspace().getId(),
                membership.getId(),
                type,
                entityType,
                entityId,
                description
        );

        activityRepository.save(activity);
    }

    private WorkspaceMembership getCurrentMembership(
            CustomUserDetails user
    ) {
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

        return memberships.get(0);
    }
}