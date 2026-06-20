package com.proyectoPortafolio.eventout_backend.dto.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;

/** Payload de creación/edición de un evento (panel admin). */
public record EventoRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,
        String descripcion,
        String idLugar,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin,
        Boolean esGratuito,
        Double precio,
        String imagenUrl
) {
}
