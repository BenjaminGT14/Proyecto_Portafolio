package com.proyectoPortafolio.eventout_backend.dto;

import java.util.List;

/** IDs de lugares/eventos que el usuario tiene como favoritos (de entre los consultados). */
public record EstadoFavoritosDto(
        List<String> lugares,
        List<String> eventos
) {
}
