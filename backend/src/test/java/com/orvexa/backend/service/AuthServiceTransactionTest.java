package com.orvexa.backend.service;

import com.orvexa.backend.dto.auth.RegisterRequest;
import com.orvexa.backend.repository.UserRepository;
import com.orvexa.backend.repository.WorkspaceRepository;
import com.orvexa.backend.entity.WorkspaceMembership;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;

@SpringBootTest
class AuthServiceTransactionTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @MockitoSpyBean
    private com.orvexa.backend.repository.WorkspaceMembershipRepository membershipRepository;

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void registerRollsBackUserAndWorkspaceWhenMembershipSaveFails() {
        String email = "rollback-" + UUID.randomUUID() + "@example.com";

        RegisterRequest request = new RegisterRequest(
                "Rollback Test",
                email,
                "StrongTestPassword123!",
                "Rollback Workspace",
                "Technology"
        );

        doThrow(new DataIntegrityViolationException("Simulated database failure"))
                .when(membershipRepository)
                .save(any());

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DataIntegrityViolationException.class);

        assertThat(userRepository.existsByEmailIgnoreCase(email)).isFalse();

        Integer workspaceCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM workspaces WHERE name = ?",
                Integer.class,
                "Rollback Workspace"
        );

        assertThat(workspaceCount).isZero();
    }


    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void registerRollsBackUserAndWorkspaceAfterDatabaseConstraintViolation() {
        String email = "db-rollback-" + UUID.randomUUID() + "@example.com";
        String workspaceName = "DB Rollback " + UUID.randomUUID();

        RegisterRequest request = new RegisterRequest(
                "Database Rollback Test",
                email,
                "StrongTestPassword123!",
                workspaceName,
                "Technology"
        );

        doAnswer(invocation -> {
            jdbcTemplate.update(
                    """
                    INSERT INTO workspace_memberships
                        (id, workspace_id, user_id, role, joined_at)
                    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                    """,
                    UUID.randomUUID(),
                    UUID.randomUUID(),
                    UUID.randomUUID(),
                    "ADMIN"
            );

            return null;
        }).when(membershipRepository).save(any(WorkspaceMembership.class));

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DataIntegrityViolationException.class);

        assertThat(userRepository.existsByEmailIgnoreCase(email)).isFalse();

        Integer workspaceCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM workspaces WHERE name = ?",
                Integer.class,
                workspaceName
        );

        assertThat(workspaceCount).isZero();
    }
}
