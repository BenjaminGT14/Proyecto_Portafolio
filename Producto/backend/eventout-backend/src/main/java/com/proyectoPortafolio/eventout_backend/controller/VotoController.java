package com.proyectoPortafolio.eventout_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.proyectoPortafolio.eventout_backend.dto.VotoDto;
import com.proyectoPortafolio.eventout_backend.dto.request.VotoRequest;
import com.proyectoPortafolio.eventout_backend.security.AuthUser;
import com.proyectoPortafolio.eventout_backend.service.VotoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/votos")
public class VotoController {

    private final VotoService votoService;

    public VotoController(VotoService votoService) {
        this.votoService = votoService;
    }

    /** Votos del usuario actual sobre un conjunto de reseñas. */
    @GetMapping
    public List<VotoDto> misVotos(
            @AuthenticationPrincipal AuthUser user,
            @RequestParam(name = "idsResenas", required = false) List<String> idsResenas
    ) {
        return votoService.votosDelUsuario(user.id(), idsResenas);
    }

    /** Vota una reseña (toggle). Devuelve el voto, o cuerpo vacío si se quitó. */
    @PostMapping
    public ResponseEntity<VotoDto> votar(
            @AuthenticationPrincipal AuthUser user,
            @Valid @RequestBody VotoRequest req
    ) {
        return ResponseEntity.ok(votoService.votar(user.id(), req));
    }
}
