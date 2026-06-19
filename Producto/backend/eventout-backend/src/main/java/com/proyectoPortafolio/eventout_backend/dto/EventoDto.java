package com.proyectoPortafolio.eventout_backend.dto;

import java.time.Instant;
import java.time.LocalDateTime;

import com.proyectoPortafolio.eventout_backend.model.enums.EstadoEvento;

public record EventoDto(
        String idEvento,
        String idLugar,
        String nombre,
        String descripcion,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin,
        Boolean esGratuito,
        Double precio,
        String imagenUrl,
        EstadoEvento estado,
        AutorDto propuestoPor,
        Instant createdAt,
        LugarDto lugar
) {
}
