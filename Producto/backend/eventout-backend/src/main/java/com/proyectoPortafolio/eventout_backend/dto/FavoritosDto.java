package com.proyectoPortafolio.eventout_backend.dto;

import java.util.List;

/** Resultado de listarFavoritos: lugares y eventos guardados por el usuario. */
public record FavoritosDto(
        List<LugarDto> lugares,
        List<EventoDto> eventos
) {
}
