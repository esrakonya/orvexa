package com.orvexa.backend.controller;

import com.orvexa.backend.entity.User;
import com.orvexa.backend.entity.Workspace;
import com.orvexa.backend.entity.WorkspaceMembership;
import com.orvexa.backend.repository.UserRepository;
import com.orvexa.backend.repository.WorkspaceMembershipRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;


@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private MockHttpServletRequestBuilder withCsrfCookie(
            MockHttpServletRequestBuilder request) throws Exception {

        var csrfResult = mockMvc.perform(get("/api/csrf"))
                .andExpect(status().isOk())
                .andReturn();

        var csrfCookie = csrfResult.getResponse().getCookie("XSRF-TOKEN");

        assertThat(csrfCookie)
                .as("/api/csrf XSRF-TOKEN cookie üretmeli")
                .isNotNull();

        return request
                .cookie(csrfCookie)
                .header("X-XSRF-TOKEN", csrfCookie.getValue());
    }

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkspaceMembershipRepository membershipRepository;

    @Test
    void registerReturnsCreatedAndPersistsAccount() throws Exception {
        String email = "http-test-" + UUID.randomUUID() + "@example.com";

        String request = """
                {
                  "name": "HTTP Test User",
                  "email": "%s",
                  "password": "StrongTestPassword123!",
                  "workspaceName": "HTTP Test Workspace",
                  "industry": "Technology"
                }
                """.formatted(email);

        mockMvc.perform(withCsrfCookie(post("/api/auth/register"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isCreated());

        User user = userRepository.findByEmail(email).orElseThrow();

        assertThat(user.getName()).isEqualTo("HTTP Test User");
        assertThat(user.getPasswordHash())
                .isNotEqualTo("StrongTestPassword123!");

        WorkspaceMembership membership =
                membershipRepository.findAllByUser_Id(user.getId())
                        .stream()
                        .findFirst()
                        .orElseThrow();

        Workspace workspace = membership.getWorkspace();

        assertThat(workspace.getName()).isEqualTo("HTTP Test Workspace");
        assertThat(workspace.getIndustry()).isEqualTo("Technology");
        assertThat(membership.getRole()).isEqualTo("ADMIN");
    }

    @Test
    void registerReturnsBadRequestForInvalidEmail() throws Exception {
        String request = """
            {
              "name": "HTTP Test User",
              "email": "not-an-email",
              "password": "StrongTestPassword123!",
              "workspaceName": "HTTP Test Workspace",
              "industry": "Technology"
            }
            """;

        mockMvc.perform(withCsrfCookie(post("/api/auth/register"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(request))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.message").isNotEmpty());
    }


    @Test
    void registerReturnsBadRequestForPasswordShorterThanMinimum() throws Exception {
        String request = """
                {
                "name": "HTTP Test User",
                "email": "short-password-%s@example.com",
                "password": "Short123!",
                "workspaceName": "HTTP Test Workspace",
                "industry": "Technology"
                }
                """.formatted(UUID.randomUUID());

        mockMvc.perform(withCsrfCookie(post("/api/auth/register"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message")
                        .value("Password must be between 12 and 72 characters."));
    }


    @Test
    void registerReturnsBadRequestForBlankName() throws Exception {
        String request = """
                {
                "name": "   ",
                "email": "blank-name@example.com",
                "password": "StrongTestPassword123!",
                "workspaceName": "HTTP Test Workspace",
                "industry": "Technology"
                }
                """;

        mockMvc.perform(withCsrfCookie(post("/api/auth/register"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message")
                        .value("Name is required."));
    }

    @Test
    void registerReturnsConflictForDuplicateEmail() throws Exception {
        String email = "duplicate-" + UUID.randomUUID() + "@example.com";

        String request = """
                {
                  "name": "HTTP Test User",
                  "email": "%s",
                  "password": "StrongTestPassword123!",
                  "workspaceName": "HTTP Test Workspace",
                  "industry": "Technology"
                }
                """.formatted(email);

        mockMvc.perform(withCsrfCookie(post("/api/auth/register"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isCreated());

        mockMvc.perform(withCsrfCookie(post("/api/auth/register"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message")
                        .value("An account with this email already exists."));
    }


    @Test
    void csrfEndpointReturnsTokenAndSetsCookie() throws Exception {
        mockMvc.perform(get("/api/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.headerName").value("X-XSRF-TOKEN"))
                .andExpect(jsonPath("$.parameterName").value("_csrf"))
                .andExpect(result -> {
                    assertThat(result.getResponse().getCookie("XSRF-TOKEN"))
                            .isNotNull();
                });
    }


    @Test
    void registerRejectsRequestWithoutCsrfToken() throws Exception {
        String request = """
                {
                "name": "CSRF Test User",
                "email": "csrf-test@example.com",
                "password": "StrongTestPassword123!",
                "workspaceName": "CSRF Test Workspace",
                "industry": "Technology"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isForbidden());
    }

    @Test
    void registerAcceptsRequestWithValidCsrfToken() throws Exception {
        String email = "csrf-valid-" + UUID.randomUUID() + "@example.com";

        String request = """
                {
                "name": "CSRF Test User",
                "email": "%s",
                "password": "StrongTestPassword123!",
                "workspaceName": "CSRF Test Workspace",
                "industry": "Technology"
                }
                """.formatted(email);

        mockMvc.perform(withCsrfCookie(post("/api/auth/register"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isCreated());
    }


    @Test
    void csrfCookieTokenIsAcceptedInRequestHeader() throws Exception {
        var csrfResult = mockMvc.perform(get("/api/csrf"))
                .andExpect(status().isOk())
                .andReturn();

        var csrfCookie = csrfResult.getResponse().getCookie("XSRF-TOKEN");

        assertThat(csrfCookie).isNotNull();

        String token = csrfCookie.getValue();

        String email = "csrf-header-" + UUID.randomUUID() + "@example.com";

        String request = """
                {
                "name": "CSRF Header Test",
                "email": "%s",
                "password": "StrongTestPassword123!",
                "workspaceName": "CSRF Header Workspace",
                "industry": "Technology"
                }
                """.formatted(email);

        mockMvc.perform((post("/api/auth/register"))
                        .cookie(csrfCookie)
                        .header("X-XSRF-TOKEN", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isCreated());
    }

    @Test
    void meRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }


    @Test
    void loginClearsCsrfCookie() throws Exception {
        String email = "csrf-login-" + UUID.randomUUID() + "@example.com";
        String password = "StrongTestPassword123!";

        String registerRequest = """
                {
                "name": "CSRF Login Test",
                "email": "%s",
                "password": "%s",
                "workspaceName": "CSRF Login Workspace",
                "industry": "Technology"
                }
                """.formatted(email, password);

        mockMvc.perform(withCsrfCookie(post("/api/auth/register"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerRequest))
                .andExpect(status().isCreated());

        String loginRequest = """
                {
                "email": "%s",
                "password": "%s"
                }
                """.formatted(email, password);

        var loginResult = mockMvc.perform(withCsrfCookie(post("/api/auth/login"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequest))
                .andExpect(status().isOk())
                .andReturn();

        var csrfCookie = loginResult.getResponse().getCookie("XSRF-TOKEN");

        assertThat(csrfCookie).isNotNull();
        assertThat(csrfCookie.getMaxAge()).isZero();
    }


    @Test
    void csrfTokenCanBeFetchedOnRepeatedRequests() throws Exception {
        var firstResult = mockMvc.perform(get("/api/csrf"))
                .andReturn();

        var firstCookie = firstResult.getResponse().getCookie("XSRF-TOKEN");

        assertThat(firstCookie)
                .as("İlk CSRF isteği XSRF-TOKEN çerezi üretmeli")
                .isNotNull();

        var secondResult = mockMvc.perform(get("/api/csrf")
                        .cookie(firstCookie))
                .andReturn();

        assertThat(secondResult.getResponse().getStatus()).isEqualTo(200);
    }

    @Test
    void loginReturnsUnauthorizedForIncorrectPassword() throws Exception {
        String email = "wrong-password-" + UUID.randomUUID() + "@example.com";
        String password = "StrongTestPassword123!";

        String registerRequest = """
                {
                "name": "Wrong Password Test",
                "email": "%s",
                "password": "%s",
                "workspaceName": "Wrong Password Workspace",
                "industry": "Technology"
                }
                """.formatted(email, password);

        mockMvc.perform(withCsrfCookie(post("/api/auth/register"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerRequest))
                .andExpect(status().isCreated());

        String loginRequest = """
                {
                "email": "%s",
                "password": "WrongPassword123!"
                }
                """.formatted(email);

        mockMvc.perform(withCsrfCookie(post("/api/auth/login"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequest))
                .andExpect(status().isUnauthorized());
    }


    @Test
    void loginReturnsUnauthorizedForUnknownEmail() throws Exception {
        String loginRequest = """
                {
                "email": "unknown-%s@example.com",
                "password": "AnyPassword123!"
                }
                """.formatted(UUID.randomUUID());

        mockMvc.perform(withCsrfCookie(post("/api/auth/login"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequest))
                .andExpect(status().isUnauthorized());
    }


    @Test
    void loginCreatesSessionAndMeReturnsAuthenticatedUser() throws Exception {
        String email = "login-" + UUID.randomUUID() + "@example.com";
        String password = "StrongTestPassword123!";

        String registerRequest = """
                {
                "name": "Login Test User",
                "email": "%s",
                "password": "%s",
                "workspaceName": "Login Test Workspace",
                "industry": "Technology"
                }
                """.formatted(email, password);

        mockMvc.perform(withCsrfCookie(post("/api/auth/register"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerRequest))
                .andExpect(status().isCreated());

        String loginRequest = """
                {
                "email": "%s",
                "password": "%s"
                }
                """.formatted(email, password);

        var loginResult = mockMvc.perform(withCsrfCookie(post("/api/auth/login"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Login Test User"))
                .andExpect(jsonPath("$.email").value(email))
                .andReturn();

        MockHttpSession session =
                (MockHttpSession) loginResult.getRequest().getSession(false);

        assertThat(session).isNotNull();

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Login Test User"))
                .andExpect(jsonPath("$.email").value(email));
    }


    @Test
    void logoutClearsCsrfCookie() throws Exception {
        String email = "csrf-logout-" + UUID.randomUUID() + "@example.com";
        String password = "StrongTestPassword123!";

        String registerRequest = """
                {
                "name": "CSRF Logout Test",
                "email": "%s",
                "password": "%s",
                "workspaceName": "CSRF Logout Workspace",
                "industry": "Technology"
                }
                """.formatted(email, password);

        mockMvc.perform(withCsrfCookie(post("/api/auth/register"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerRequest))
                .andExpect(status().isCreated());

        String loginRequest = """
                {
                "email": "%s",
                "password": "%s"
                }
                """.formatted(email, password);

        var loginResult = mockMvc.perform(withCsrfCookie(post("/api/auth/login"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequest))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession session =
                (MockHttpSession) loginResult.getRequest().getSession(false);

        assertThat(session).isNotNull();

        var logoutResult = mockMvc.perform(withCsrfCookie(post("/api/auth/logout"))
                        .session(session))
                .andExpect(status().isNoContent())
                .andReturn();

        var csrfCookie = logoutResult.getResponse().getCookie("XSRF-TOKEN");

        assertThat(csrfCookie).isNotNull();
        assertThat(csrfCookie.getMaxAge()).isZero();
    }

    @Test
    void logoutInvalidatesSessionAndPreventsFurtherAccess() throws Exception {
        String email = "logout-" + UUID.randomUUID() + "@example.com";
        String password = "StrongTestPassword123!";

        String registerRequest = """
                {
                "name": "Logout Test User",
                "email": "%s",
                "password": "%s",
                "workspaceName": "Logout Test Workspace",
                "industry": "Technology"
                }
                """.formatted(email, password);

        mockMvc.perform(withCsrfCookie(post("/api/auth/register"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerRequest))
                .andExpect(status().isCreated());

        String loginRequest = """
                {
                "email": "%s",
                "password": "%s"
                }
                """.formatted(email, password);

        var loginResult = mockMvc.perform(withCsrfCookie(post("/api/auth/login"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequest))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession session =
                (MockHttpSession) loginResult.getRequest().getSession(false);

        assertThat(session).isNotNull();

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk());

        mockMvc.perform(withCsrfCookie(post("/api/auth/logout"))
                        .session(session))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isUnauthorized());
    }
}