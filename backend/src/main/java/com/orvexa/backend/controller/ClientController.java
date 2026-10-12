package com.orvexa.backend.controller;

import com.orvexa.backend.dto.client.ClientResponse;
import com.orvexa.backend.dto.client.CreateClientRequest;
import com.orvexa.backend.dto.client.UpdateClientRequest;
import com.orvexa.backend.security.CustomUserDetails;
import com.orvexa.backend.service.ClientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping
    public ResponseEntity<List<ClientResponse>> getAllClients(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(clientService.getAllClients(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientResponse> getClientById(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(clientService.getClientById(id, user));
    }

    @PostMapping
    public ResponseEntity<ClientResponse> createClient(
            @Valid @RequestBody CreateClientRequest request,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        ClientResponse response = clientService.createClient(request, user);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ClientResponse> updateClient(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateClientRequest request,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                clientService.updateClient(id, request, user)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        clientService.deleteClient(id, user);
        return ResponseEntity.noContent().build();
    }
}