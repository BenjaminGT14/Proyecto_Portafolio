package com.proyectoPortafolio.eventout_backend.dto.request;

/** Alterna favorito sobre un lugar XOR un evento. El usuario se toma del JWT. */
public record FavoritoToggleRequest(
        String idLugar,
        String idEvento
) {
}
