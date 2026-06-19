package com.proyectoPortafolio.eventout_backend.controller.admin;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.proyectoPortafolio.eventout_backend.dto.EventoDto;
import com.proyectoPortafolio.eventout_backend.dto.request.CambiarEstadoEventoRequest;
import com.proyectoPortafolio.eventout_backend.dto.request.EventoRequest;
import com.proyectoPortafolio.eventout_backend.model.enums.EstadoEvento;
import com.proyectoPortafolio.eventout_backend.service.EventoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/admin/eventos")
public class AdminEventoController {

    private final EventoService eventoService;

    public AdminEventoController(EventoService eventoService) {
        this.eventoService = eventoService;
    }

    /** Lista todos los eventos (cualquier estado) o filtra por estado (?estado=pendiente). */
    @GetMapping
    public List<EventoDto> listar(@RequestParam(required = false) String estado) {
        // EstadoEvento.from acepta minúsculas ("pendiente") y nombre de constante.
        EstadoEvento filtro = (estado == null || estado.isBlank()) ? null : EstadoEvento.from(estado);
        return eventoService.listarAdmin(filtro);
    }

    @PostMapping
    public ResponseEntity<EventoDto> crear(@Valid @RequestBody EventoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventoService.crear(req));
    }

    /** Aprobar/rechazar una propuesta de evento. */
    @PatchMapping("/{id}/estado")
    public EventoDto cambiarEstado(
            @PathVariable String id,
            @Valid @RequestBody CambiarEstadoEventoRequest req
    ) {
        return eventoService.cambiarEstado(id, req.estado());
    }

    @PutMapping("/{id}")
    public EventoDto actualizar(@PathVariable String id, @Valid @RequestBody EventoRequest req) {
        return eventoService.actualizar(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        eventoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
