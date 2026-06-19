package com.proyectoPortafolio.eventout_backend.controller.admin;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.proyectoPortafolio.eventout_backend.dto.ResenaDto;
import com.proyectoPortafolio.eventout_backend.dto.request.CambiarEstadoResenaRequest;
import com.proyectoPortafolio.eventout_backend.service.ResenaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/admin/resenas")
public class AdminResenaController {

    private final ResenaService resenaService;

    public AdminResenaController(ResenaService resenaService) {
        this.resenaService = resenaService;
    }

    /** Todas las reseñas (cualquier estado) para moderación. */
    @GetMapping
    public List<ResenaDto> listar() {
        return resenaService.listarAdmin();
    }

    /** Cambia el estado de una reseña (visible/oculta/eliminada). */
    @PatchMapping("/{id}")
    public ResenaDto cambiarEstado(
            @PathVariable String id,
            @Valid @RequestBody CambiarEstadoResenaRequest req
    ) {
        return resenaService.cambiarEstado(id, req.estado());
    }
}
