
package com.orvexa.backend.exception;

public record ApiError(
        int status,
        String message
) {
}