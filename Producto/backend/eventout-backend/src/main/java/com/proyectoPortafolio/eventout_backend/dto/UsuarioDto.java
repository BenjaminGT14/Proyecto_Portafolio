package com.proyectoPortafolio.eventout_backend.dto;

import com.proyectoPortafolio.eventout_backend.model.enums.Rol;

/**
 * Perfil público del usuario que consume el frontend: identidad (id, email)
 * más los datos de la tabla usuario (nombre, avatar, rol).
 */
public record UsuarioDto(
        String idUsuario,
        String email,
        String nombre,
        String avatarUrl,
        Rol rol
) {
}
