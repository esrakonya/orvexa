package com.orvexa.backend.service;

import com.orvexa.backend.entity.User;
import com.orvexa.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthenticationServiceTest {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private AuthenticationService authenticationService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);

        authenticationService = new AuthenticationService(
                userRepository,
                passwordEncoder
        );
    }

    @Test
    void authenticateReturnsActiveUserWhenCredentialsAreCorrect() {
        User user = new User(
                "Test User",
                "test@example.com",
                "encoded-password"
        );

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches(
                "StrongTestPassword123!",
                "encoded-password"
        )).thenReturn(true);

        User authenticatedUser = authenticationService.authenticate(
                " TEST@EXAMPLE.COM ",
                "StrongTestPassword123!"
        );

        assertThat(authenticatedUser).isSameAs(user);
    }

    @Test
    void authenticateRejectsIncorrectPassword() {
        User user = new User(
                "Test User",
                "test@example.com",
                "encoded-password"
        );

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches(
                "WrongPassword123!",
                "encoded-password"
        )).thenReturn(false);

        assertThatThrownBy(() -> authenticationService.authenticate(
                "test@example.com",
                "WrongPassword123!"
        )).isInstanceOf(BadCredentialsException.class)
          .hasMessage("Invalid email or password.");
    }

    @Test
    void authenticateRejectsUnknownEmail() {
        when(userRepository.findByEmail("unknown@example.com"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> authenticationService.authenticate(
                "unknown@example.com",
                "AnyPassword123!"
        )).isInstanceOf(BadCredentialsException.class)
          .hasMessage("Invalid email or password.");
    }
}
