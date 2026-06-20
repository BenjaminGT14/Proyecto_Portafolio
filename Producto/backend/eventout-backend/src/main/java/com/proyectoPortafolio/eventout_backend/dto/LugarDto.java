package com.proyectoPortafolio.eventout_backend.dto;

import java.time.Instant;

public record LugarDto(
        String idLugar,
        String idCategoria,
        String nombre,
        String descripcion,
        String direccion,
        String comuna,
        Double latitud,
        Double longitud,
        Boolean esGratuito,
        Double precio,
        String horario,
        String imagenUrl,
        String wikipediaSlug,
        Instant createdAt,
        CategoriaDto categoria
) {
}
