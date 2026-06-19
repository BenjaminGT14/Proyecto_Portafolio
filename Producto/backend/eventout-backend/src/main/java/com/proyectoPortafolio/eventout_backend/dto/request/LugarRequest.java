package com.proyectoPortafolio.eventout_backend.dto.request;

import jakarta.validation.constraints.NotBlank;

/** Payload de creación/edición de un lugar (panel admin). */
public record LugarRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,
        String descripcion,
        String direccion,
        String comuna,
        String idCategoria,
        Boolean esGratuito,
        Double precio,
        String horario,
        Double latitud,
        Double longitud,
        String imagenUrl,
        String wikipediaSlug
) {
}
