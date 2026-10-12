package com.orvexa.backend.service;

import com.orvexa.backend.dto.client.*;
import com.orvexa.backend.entity.Client;
import com.orvexa.backend.entity.WorkspaceMembership;
import com.orvexa.backend.repository.*;
import com.orvexa.backend.security.CustomUserDetails;
import com.orvexa.backend.service.ActivityService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final WorkspaceMembershipRepository membershipRepository;
    private final ActivityService activityService;

    public ClientService(
            ClientRepository clientRepository,
            ProjectRepository projectRepository,
            WorkspaceMembershipRepository membershipRepository,
            ActivityService activityService
    ) {
        this.clientRepository = clientRepository;
        this.projectRepository = projectRepository;
        this.membershipRepository = membershipRepository;
        this.activityService = activityService;
    }

    @Transactional(readOnly = true)
    public List<ClientResponse> getAllClients(CustomUserDetails user) {
        UUID workspaceId = getWorkspaceId(user);

        return clientRepository.findAllByWorkspaceId(workspaceId)
                .stream()
                .map(ClientResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClientResponse getClientById(UUID id, CustomUserDetails user) {
        return ClientResponse.from(findClient(id, getWorkspaceId(user)));
    }

    @Transactional
    public ClientResponse createClient(
            CreateClientRequest request,
            CustomUserDetails user
    ) {
        UUID workspaceId = getWorkspaceId(user);

        Client client = new Client(
                workspaceId,
                request.name().trim(),
                request.email().trim().toLowerCase(),
                clean(request.phone()),
                request.industry().trim(),
                clean(request.notes())
        );

        Client savedClient = clientRepository.save(client);

        activityService.recordActivity(
                user,
                "CREATED",
                "CLIENT",
                savedClient.getId(),
                "created a client: " + savedClient.getName()
        );

        return ClientResponse.from(savedClient);
    }


    @Transactional
    public ClientResponse updateClient(
            UUID id,
            UpdateClientRequest request,
            CustomUserDetails user
    ) {
        Client client = findClient(id, getWorkspaceId(user));

        if (request.name() != null) client.setName(request.name().trim());
        if (request.email() != null)
            client.setEmail(request.email().trim().toLowerCase());
        if (request.phone() != null) client.setPhone(clean(request.phone()));
        if (request.industry() != null)
            client.setIndustry(request.industry().trim());
        if (request.notes() != null) client.setNotes(clean(request.notes()));
        if (request.status() != null) client.setStatus(request.status());

        Client updatedClient = clientRepository.save(client);

        activityService.recordActivity(
                user,
                "UPDATED",
                "CLIENT",
                updatedClient.getId(),
                "updated a client: " + updatedClient.getName()
        );

        return ClientResponse.from(updatedClient);
    }


    @Transactional
    public void deleteClient(UUID id, CustomUserDetails user) {
        UUID workspaceId = getWorkspaceId(user);
        Client client = findClient(id, workspaceId);

        if (projectRepository.existsByClientIdAndWorkspaceId(id, workspaceId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete a client that has associated projects."
            );
        }

        activityService.recordActivity(
                user,
                "DELETED",
                "CLIENT",
                client.getId(),
                "deleted a client: " + client.getName()
        );

        clientRepository.delete(client);
    }


    private Client findClient(UUID id, UUID workspaceId) {
        return clientRepository.findByIdAndWorkspaceId(id, workspaceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Client not found."
                ));
    }

    private UUID getWorkspaceId(CustomUserDetails user) {
        List<WorkspaceMembership> memberships =
                membershipRepository.findAllByUser_Id(user.getId());

        if (memberships.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "No workspace membership found."
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

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}