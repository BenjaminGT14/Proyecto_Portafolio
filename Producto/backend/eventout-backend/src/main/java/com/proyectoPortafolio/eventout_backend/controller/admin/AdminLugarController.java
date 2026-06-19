package com.proyectoPortafolio.eventout_backend.controller.admin;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.proyectoPortafolio.eventout_backend.dto.LugarDto;
import com.proyectoPortafolio.eventout_backend.dto.request.LugarRequest;
import com.proyectoPortafolio.eventout_backend.service.LugarService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/admin/lugares")
public class AdminLugarController {

    private final LugarService lugarService;

    public AdminLugarController(LugarService lugarService) {
        this.lugarService = lugarService;
    }

    @PostMapping
    public ResponseEntity<LugarDto> crear(@Valid @RequestBody LugarRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lugarService.crear(req));
    }

    @PutMapping("/{id}")
    public LugarDto actualizar(@PathVariable String id, @Valid @RequestBody LugarRequest req) {
        return lugarService.actualizar(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        lugarService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
