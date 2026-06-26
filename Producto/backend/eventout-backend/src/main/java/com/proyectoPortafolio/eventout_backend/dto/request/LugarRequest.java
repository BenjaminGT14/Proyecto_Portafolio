package com.proyectoPortafolio.eventout_backend.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/** Payload de creación/edición de un lugar (panel admin). */
public record LugarRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 150, message = "El nombre no puede superar 150 caracteres")
        String nombre,

        @Size(max = 2000, message = "La descripción no puede superar 2000 caracteres")
        String descripcion,

        @Size(max = 200, message = "La dirección no puede superar 200 caracteres")
        String direccion,

        @Size(max = 100, message = "La comuna no puede superar 100 caracteres")
        String comuna,

        String idCategoria,

        Boolean esGratuito,

        @PositiveOrZero(message = "El precio no puede ser negativo")
        Double precio,

        @Size(max = 120, message = "El horario no puede superar 120 caracteres")
        String horario,

        @DecimalMin(value = "-90.0", message = "Latitud fuera de rango")
        @DecimalMax(value = "90.0", message = "Latitud fuera de rango")
        Double latitud,

        @DecimalMin(value = "-180.0", message = "Longitud fuera de rango")
        @DecimalMax(value = "180.0", message = "Longitud fuera de rango")
        Double longitud,

        @Size(max = 1000, message = "La URL de imagen no puede superar 1000 caracteres")
        String imagenUrl,

        @Size(max = 255, message = "El identificador de Wikipedia no puede superar 255 caracteres")
        String wikipediaSlug
) {
}
