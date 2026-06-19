package com.proyectoPortafolio.eventout_backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.proyectoPortafolio.eventout_backend.dto.LugarDto;
import com.proyectoPortafolio.eventout_backend.service.LugarService;

@RestController
@RequestMapping("/lugares")
public class LugarController {

    private final LugarService lugarService;

    public LugarController(LugarService lugarService) {
        this.lugarService = lugarService;
    }

    @GetMapping
    public List<LugarDto> listar(
            @RequestParam(required = false) String idCategoria,
            @RequestParam(required = false) String comuna,
            @RequestParam(required = false) String costo,
            @RequestParam(required = false) String q
    ) {
        return lugarService.listar(idCategoria, comuna, costo, q);
    }

    @GetMapping("/{id}")
    public LugarDto obtener(@PathVariable String id) {
        return lugarService.obtener(id);
    }
}
