package com.proyectoPortafolio.eventout_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Voto sobre una reseña. El usuario se toma del JWT. */
public record VotoRequest(
        @NotBlank(message = "La reseña es obligatoria")
        String idResena,

        @NotNull(message = "es_positivo es obligatorio")
        Boolean esPositivo
) {
}
