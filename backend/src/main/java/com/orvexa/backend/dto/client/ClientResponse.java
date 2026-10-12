package com.orvexa.backend.dto.client;

import com.orvexa.backend.entity.Client;

import java.time.Instant;
import java.util.UUID;

public record ClientResponse(
        UUID id,
        UUID workspaceId,
        String name,
        String email,
        String phone,
        String industry,
        String status,
        String notes,
        Instant createdAt
) {

    public static ClientResponse from(Client client) {
        return new ClientResponse(
                client.getId(),
                client.getWorkspaceId(),
                client.getName(),
                client.getEmail(),
                client.getPhone(),
                client.getIndustry(),
                client.getStatus(),
                client.getNotes(),
                client.getCreatedAt()
        );
    }
}
