package com.proyectoPortafolio.eventout_backend.dto.request;

import com.proyectoPortafolio.eventout_backend.model.enums.EstadoResena;

import jakarta.validation.constraints.NotNull;

public record CambiarEstadoResenaRequest(
        @NotNull(message = "El estado es obligatorio")
        EstadoResena estado
) {
}
