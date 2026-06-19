package com.proyectoPortafolio.eventout_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.proyectoPortafolio.eventout_backend.dto.ResenaDto;
import com.proyectoPortafolio.eventout_backend.dto.request.ResenaRequest;
import com.proyectoPortafolio.eventout_backend.security.AuthUser;
import com.proyectoPortafolio.eventout_backend.service.ResenaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/resenas")
public class ResenaController {

    private final ResenaService resenaService;

    public ResenaController(ResenaService resenaService) {
        this.resenaService = resenaService;
    }

    /** Reseñas visibles de un lugar XOR un evento (público). */
    @GetMapping
    public List<ResenaDto> listar(
            @RequestParam(required = false) String idLugar,
            @RequestParam(required = false) String idEvento
    ) {
        return resenaService.listarPublicas(idLugar, idEvento);
    }

    /** Publicar una reseña (autenticado). */
    @PostMapping
    public ResponseEntity<ResenaDto> publicar(
            @AuthenticationPrincipal AuthUser user,
            @Valid @RequestBody ResenaRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resenaService.publicar(user.id(), req));
    }
}
