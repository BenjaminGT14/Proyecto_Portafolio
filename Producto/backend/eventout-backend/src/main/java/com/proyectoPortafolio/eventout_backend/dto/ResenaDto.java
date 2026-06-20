package com.proyectoPortafolio.eventout_backend.dto;

import java.time.Instant;

import com.proyectoPortafolio.eventout_backend.model.enums.EstadoResena;

/**
 * Reseña enriquecida: replica la vista resena_con_votos del esquema anterior
 * (conteo de votos + score + autor) y, para el panel admin, el lugar/evento.
 */
public record ResenaDto(
        String idResena,
        String idUsuario,
        String idLugar,
        String idEvento,
        String titulo,
        String contenido,
        Integer puntuacion,
        EstadoResena estado,
        Instant createdAt,
        long votosPositivos,
        long votosNegativos,
        long score,
        AutorDto autor,
        LugarDto lugar,
        EventoDto evento
) {
}
