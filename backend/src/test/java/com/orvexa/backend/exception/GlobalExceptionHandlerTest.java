package com.orvexa.backend.exception;

import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;

import java.sql.SQLException;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler =
            new GlobalExceptionHandler();

    @Test
    void existingEmailExceptionReturnsConflict() {
        ResponseEntity<ApiError> response =
                handler.handleEmailAlreadyExists(
                        new EmailAlreadyExistsException()
                );

        assertThat(response.getStatusCode().value()).isEqualTo(409);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(409);
    }

    @Test
    void emailUniqueConstraintViolationReturnsConflict() {
        ConstraintViolationException constraintException =
                new ConstraintViolationException(
                        "Duplicate email",
                        new SQLException("Duplicate email"),
                        "uq_users_email_lower"
                );

        DataIntegrityViolationException exception =
                new DataIntegrityViolationException(
                        "Database constraint violation",
                        constraintException
                );

        ResponseEntity<ApiError> response =
                handler.handleDataIntegrityViolation(exception);

        assertThat(response.getStatusCode().value()).isEqualTo(409);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(409);
        assertThat(response.getBody().message())
                .isEqualTo("An account with this email already exists.");
    }

    @Test
    void otherConstraintViolationReturnsInternalServerError() {
        ConstraintViolationException constraintException =
                new ConstraintViolationException(
                        "Foreign key violation",
                        new SQLException("Foreign key violation"),
                        "fk_projects_workspace"
                );

        DataIntegrityViolationException exception =
                new DataIntegrityViolationException(
                        "Database constraint violation",
                        constraintException
                );

        ResponseEntity<ApiError> response =
                handler.handleDataIntegrityViolation(exception);

        assertThat(response.getStatusCode().value()).isEqualTo(500);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(500);
        assertThat(response.getBody().message())
                .isEqualTo("A database error occurred.");
    }
}
