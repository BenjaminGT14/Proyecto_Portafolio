package com.proyectoPortafolio.eventout_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.proyectoPortafolio.eventout_backend.dto.EventoDto;
import com.proyectoPortafolio.eventout_backend.dto.request.EventoRequest;
import com.proyectoPortafolio.eventout_backend.security.AuthUser;
import com.proyectoPortafolio.eventout_backend.service.EventoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/eventos")
public class EventoController {

    private final EventoService eventoService;

    public EventoController(EventoService eventoService) {
        this.eventoService = eventoService;
    }

    @GetMapping
    public List<EventoDto> listar(
            @RequestParam(required = false) String comuna,
            @RequestParam(required = false) String costo,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String desde
    ) {
        return eventoService.listar(comuna, costo, q, desde);
    }

    @GetMapping("/{id}")
    public EventoDto obtener(@PathVariable String id) {
        return eventoService.obtener(id);
    }

    /**
     * Propuesta de evento por un usuario autenticado. Usa el mismo payload que el
     * alta de admin, pero queda PENDIENTE de aprobación.
     */
    @PostMapping("/propuestas")
    public ResponseEntity<EventoDto> proponer(
            @AuthenticationPrincipal AuthUser user,
            @Valid @RequestBody EventoRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventoService.proponer(user.id(), req));
    }
}
