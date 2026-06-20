package com.proyectoPortafolio.eventout_backend.dto.request;

import com.proyectoPortafolio.eventout_backend.model.enums.EstadoEvento;

import jakarta.validation.constraints.NotNull;

/** Cambio de estado de un evento por el admin (aprobar/rechazar). */
public record CambiarEstadoEventoRequest(
        @NotNull(message = "El estado es obligatorio")
        EstadoEvento estado
) {
}
