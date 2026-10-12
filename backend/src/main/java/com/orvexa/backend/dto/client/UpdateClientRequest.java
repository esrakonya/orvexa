package com.orvexa.backend.dto.client;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateClientRequest(

        @Pattern(
                regexp = ".*\\S.*",
                message = "Client name must not be blank."
        )
        @Size(max = 150, message = "Client name must not exceed 150 characters.")
        String name,

        @Email(message = "Email must be valid.")
        @Pattern(
                regexp = ".*\\S.*",
                message = "Email must not be blank."
        )
        @Size(max = 255, message = "Email must not exceed 255 characters.")
        String email,

        @Size(max = 50, message = "Phone must not exceed 50 characters.")
        String phone,

        @Pattern(
                regexp = ".*\\S.*",
                message = "Industry must not be blank."
        )
        @Size(max = 100, message = "Industry must not exceed 100 characters.")
        String industry,

        String notes,

        @Pattern(
                regexp = "ACTIVE|INACTIVE",
                message = "Status must be ACTIVE or INACTIVE."
        )
        String status
) {
}
