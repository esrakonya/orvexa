package com.orvexa.backend.service;

import com.orvexa.backend.dto.auth.RegisterRequest;
import com.orvexa.backend.entity.User;
import com.orvexa.backend.entity.Workspace;
import com.orvexa.backend.entity.WorkspaceMembership;
import com.orvexa.backend.repository.UserRepository;
import com.orvexa.backend.repository.WorkspaceMembershipRepository;
import com.orvexa.backend.repository.WorkspaceRepository;
import com.orvexa.backend.exception.EmailAlreadyExistsException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private WorkspaceMembershipRepository membershipRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void registerCreatesUserWorkspaceAndAdminMembership() {
        String email = "test-" + UUID.randomUUID() + "@example.com";
        String rawPassword = "StrongTestPassword123!";

        RegisterRequest request = new RegisterRequest(
                "Test User",
                email,
                rawPassword,
                "Test Workspace",
                "Technology"
        );

        authService.register(request);

        User user = userRepository.findByEmail(email).orElseThrow();

        assertThat(user.getName()).isEqualTo("Test User");
        assertThat(user.getEmail()).isEqualTo(email.toLowerCase());
        assertThat(user.getPasswordHash()).isNotEqualTo(rawPassword);
        assertThat(passwordEncoder.matches(
                rawPassword,
                user.getPasswordHash()
        )).isTrue();

        WorkspaceMembership membership = membershipRepository.findAllByUser_Id(user.getId())
                    .stream()
                    .findFirst()
                    .orElseThrow();

        Workspace workspace = membership.getWorkspace();

        assertThat(workspace.getName()).isEqualTo("Test Workspace");
        assertThat(workspace.getIndustry()).isEqualTo("Technology");
        assertThat(membership.getRole()).isEqualTo("ADMIN");
        assertThat(membership.getUser().getId()).isEqualTo(user.getId());
    }


    @Test
    void registerRejectsDuplicateEmail() {
        String email = "duplicate-" + UUID.randomUUID() + "@example.com";

        RegisterRequest firstRequest = new RegisterRequest(
                "First User",
                email,
                "StrongTestPassword123!",
                "First Workspace",
                "Technology"
        );

        RegisterRequest secondRequest = new RegisterRequest(
                "Second User",
                email.toUpperCase(),
                "AnotherStrongPassword123!",
                "Second Workspace",
                "Finance"
        );

        authService.register(firstRequest);

        org.assertj.core.api.Assertions.assertThatThrownBy(
                () -> authService.register(secondRequest)
        ).isInstanceOf(EmailAlreadyExistsException.class)
         .hasMessage("An account with this email already exists.");
    }

    @Test
    void registerRejectsBlankNameAndWorkspaceName() {
        String email = "blank-" + UUID.randomUUID() + "@example.com";

        RegisterRequest request = new RegisterRequest(
                "   ",
                email,
                "StrongTestPassword123!",
                "   ",
                "Technology"
        );

        org.assertj.core.api.Assertions.assertThatThrownBy(
                () -> authService.register(request)
        ).isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Name and workspace name must not be blank.");
    }


    @Test
    void registerRejectsPasswordExceedingBcryptByteLimit() {
        String email = "long-password-" + UUID.randomUUID() + "@example.com";
        String password = "😀".repeat(19);

        RegisterRequest request = new RegisterRequest(
                "Test User",
                email,
                password,
                "Test Workspace",
                "Technology"
        );

        org.assertj.core.api.Assertions.assertThatThrownBy(
                () -> authService.register(request)
        ).isInstanceOf(IllegalArgumentException.class)
        .hasMessage(
                "Password must not exceed 72 bytes when encoded as UTF-8."
        );
    }
}