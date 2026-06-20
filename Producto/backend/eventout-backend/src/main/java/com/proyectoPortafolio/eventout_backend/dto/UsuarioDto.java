package com.proyectoPortafolio.eventout_backend.dto;

import com.proyectoPortafolio.eventout_backend.model.enums.Rol;

/**
 * Perfil público del usuario. Combina lo que el frontend obtenía de
 * supabase.auth.user (id, email) y de la tabla usuario (nombre, avatar, rol).
 */
public record UsuarioDto(
        String idUsuario,
        String email,
        String nombre,
        String avatarUrl,
        Rol rol
) {
}
