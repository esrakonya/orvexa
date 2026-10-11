package com.orvexa.backend.dto.client;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateClientRequest(

        @NotBlank(message = "Client name is required.")
        @Size(max = 150, message = "Client name must not exceed 150 characters.")
        String name,

        @NotBlank(message = "Email is required.")
        @Email(message = "Email must be valid.")
        @Size(max = 255, message = "Email must not exceed 255 characters.")
        String email,

        @Size(max = 50, message = "Phone must not exceed 50 characters.")
        String phone,

        @NotBlank(message = "Industry is required.")
        @Size(max = 100, message = "Industry must not exceed 100 characters.")
        String industry,

        String notes
) {
}
