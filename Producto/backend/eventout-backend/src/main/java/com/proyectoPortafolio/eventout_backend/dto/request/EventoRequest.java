package com.proyectoPortafolio.eventout_backend.dto.request;

import java.time.LocalDateTime;

import com.proyectoPortafolio.eventout_backend.validation.FechasEventoValidas;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/** Payload de creación/edición de un evento (panel admin) y de propuesta (usuario). */
@FechasEventoValidas
public record EventoRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 150, message = "El nombre no puede superar 150 caracteres")
        String nombre,

        @Size(max = 2000, message = "La descripción no puede superar 2000 caracteres")
        String descripcion,

        String idLugar,

        LocalDateTime fechaInicio,

        LocalDateTime fechaFin,

        Boolean esGratuito,

        @PositiveOrZero(message = "El precio no puede ser negativo")
        Double precio,

        @Size(max = 1000, message = "La URL de imagen no puede superar 1000 caracteres")
        String imagenUrl
) {
}
