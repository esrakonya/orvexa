package com.orvexa.backend.controller;

import com.orvexa.backend.dto.auth.LoginRequest;
import com.orvexa.backend.dto.auth.LoginResponse;
import com.orvexa.backend.dto.auth.RegisterRequest;
import com.orvexa.backend.security.CustomUserDetails;
import com.orvexa.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final CookieCsrfTokenRepository csrfTokenRepository;

    public AuthController(
            AuthService authService,
            AuthenticationManager authenticationManager,
            SecurityContextRepository securityContextRepository,
            CookieCsrfTokenRepository csrfTokenRepository
    ) {
        this.authService = authService;
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
        this.csrfTokenRepository = csrfTokenRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email().trim().toLowerCase(java.util.Locale.ROOT),
                        request.password()
                )
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        securityContextRepository.saveContext(
                context,
                httpRequest,
                httpResponse
        );

        csrfTokenRepository.saveToken(null, httpRequest, httpResponse);

        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        return ResponseEntity.ok(
                new LoginResponse(
                        userDetails.getId(),
                        userDetails.getName(),
                        userDetails.getUsername()
                )
        );
    }

    @GetMapping("/me")
    public ResponseEntity<LoginResponse> me(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(
                new LoginResponse(
                        userDetails.getId(),
                        userDetails.getName(),
                        userDetails.getUsername()
                )
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            Authentication authentication,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        SecurityContextLogoutHandler logoutHandler =
                new SecurityContextLogoutHandler();

        logoutHandler.logout(
                request,
                response,
                authentication
        );

        csrfTokenRepository.saveToken(null, request, response);

        return ResponseEntity.noContent().build();
    }
}