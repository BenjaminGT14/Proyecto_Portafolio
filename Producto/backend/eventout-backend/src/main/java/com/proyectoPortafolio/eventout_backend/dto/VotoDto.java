package com.proyectoPortafolio.eventout_backend.dto;

public record VotoDto(
        String idVoto,
        String idUsuario,
        String idResena,
        Boolean esPositivo
) {
}
