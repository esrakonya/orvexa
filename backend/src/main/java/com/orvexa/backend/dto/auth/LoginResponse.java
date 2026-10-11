package com.orvexa.backend.dto.auth;

import java.util.UUID;

public record LoginResponse(
        UUID id,
        String name,
        String email
) {
}