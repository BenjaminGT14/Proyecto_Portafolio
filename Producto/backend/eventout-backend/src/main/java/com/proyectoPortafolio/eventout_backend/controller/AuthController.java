package com.proyectoPortafolio.eventout_backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.proyectoPortafolio.eventout_backend.dto.AuthResponse;
import com.proyectoPortafolio.eventout_backend.dto.UsuarioDto;
import com.proyectoPortafolio.eventout_backend.dto.request.LoginRequest;
import com.proyectoPortafolio.eventout_backend.dto.request.RegisterRequest;
import com.proyectoPortafolio.eventout_backend.security.AuthUser;
import com.proyectoPortafolio.eventout_backend.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @GetMapping("/me")
    public UsuarioDto me(@AuthenticationPrincipal AuthUser user) {
        return authService.me(user.id());
    }
}
