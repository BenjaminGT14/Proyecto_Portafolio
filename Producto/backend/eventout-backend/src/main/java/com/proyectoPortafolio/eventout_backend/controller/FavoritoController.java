package com.proyectoPortafolio.eventout_backend.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.proyectoPortafolio.eventout_backend.dto.EstadoFavoritosDto;
import com.proyectoPortafolio.eventout_backend.dto.FavoritosDto;
import com.proyectoPortafolio.eventout_backend.dto.ToggleResultDto;
import com.proyectoPortafolio.eventout_backend.dto.request.FavoritoToggleRequest;
import com.proyectoPortafolio.eventout_backend.security.AuthUser;
import com.proyectoPortafolio.eventout_backend.service.FavoritoService;

@RestController
@RequestMapping("/favoritos")
public class FavoritoController {

    private final FavoritoService favoritoService;

    public FavoritoController(FavoritoService favoritoService) {
        this.favoritoService = favoritoService;
    }

    /** Lugares y eventos favoritos del usuario actual. */
    @GetMapping
    public FavoritosDto listar(@AuthenticationPrincipal AuthUser user) {
        return favoritoService.listar(user.id());
    }

    /** Cuáles de los IDs consultados son favoritos del usuario. */
    @GetMapping("/estado")
    public EstadoFavoritosDto estado(
            @AuthenticationPrincipal AuthUser user,
            @RequestParam(name = "idLugares", required = false) List<String> idLugares,
            @RequestParam(name = "idEventos", required = false) List<String> idEventos
    ) {
        return favoritoService.estado(user.id(), idLugares, idEventos);
    }

    /** Alterna un favorito (lugar XOR evento). */
    @PostMapping("/toggle")
    public ToggleResultDto toggle(
            @AuthenticationPrincipal AuthUser user,
            @RequestBody FavoritoToggleRequest req
    ) {
        return favoritoService.toggle(user.id(), req);
    }
}
