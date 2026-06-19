package com.proyectoPortafolio.eventout_backend.dto;

/** Autor de una reseña (subconjunto público del usuario). */
public record AutorDto(
        String idUsuario,
        String nombre,
        String avatarUrl
) {
}
