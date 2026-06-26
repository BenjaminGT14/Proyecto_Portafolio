package com.proyectoPortafolio.eventout_backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Payload para publicar una reseña. El autor (id_usuario) se toma del JWT,
 * no del body. Debe apuntar a un lugar XOR un evento.
 */
public record ResenaRequest(
        String idLugar,
        String idEvento,

        @Size(max = 120, message = "El título no puede superar 120 caracteres")
        String titulo,

        @Size(max = 2000, message = "La reseña no puede superar 2000 caracteres")
        String contenido,

        @NotNull(message = "La puntuación es obligatoria")
        @Min(value = 1, message = "La puntuación mínima es 1")
        @Max(value = 5, message = "La puntuación máxima es 5")
        Integer puntuacion
) {
}
