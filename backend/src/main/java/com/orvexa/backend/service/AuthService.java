
package com.orvexa.backend.service;

import com.orvexa.backend.dto.auth.RegisterRequest;
import com.orvexa.backend.entity.User;
import com.orvexa.backend.entity.Workspace;
import com.orvexa.backend.entity.WorkspaceMembership;
import com.orvexa.backend.repository.UserRepository;
import com.orvexa.backend.repository.WorkspaceMembershipRepository;
import com.orvexa.backend.repository.WorkspaceRepository;
import com.orvexa.backend.exception.EmailAlreadyExistsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Service
public class AuthService {

    private static final int BCRYPT_MAX_PASSWORD_BYTES = 72;

    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMembershipRepository membershipRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMembershipRepository membershipRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.workspaceRepository = workspaceRepository;
        this.membershipRepository = membershipRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void register(RegisterRequest request) {
        String name = request.name().trim();
        String email = normalizeEmail(request.email());
        String workspaceName = request.workspaceName().trim();
        String industry = normalizeOptionalText(request.industry());
        String password = request.password();

        if (name.isBlank() || workspaceName.isBlank()) {
            throw new IllegalArgumentException(
                "Name and workspace name must not be blank."
            );
        }
        validatePasswordLength(password);

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new EmailAlreadyExistsException();
        }

        String passwordHash = passwordEncoder.encode(password);
        User user = new User(name, email, passwordHash);
        user = userRepository.save(user);

        Workspace workspace = new Workspace(workspaceName, industry);
        workspace = workspaceRepository.save(workspace);

        WorkspaceMembership membership = new WorkspaceMembership(
                workspace,
                user,
                "ADMIN"
        );
        membershipRepository.save(membership);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private void validatePasswordLength(String password) {
        int byteLength = password.getBytes(StandardCharsets.UTF_8).length;

        if (byteLength > BCRYPT_MAX_PASSWORD_BYTES) {
            throw new IllegalArgumentException(
                    "Password must not exceed 72 bytes when encoded as UTF-8."
            );
        }
    }
}