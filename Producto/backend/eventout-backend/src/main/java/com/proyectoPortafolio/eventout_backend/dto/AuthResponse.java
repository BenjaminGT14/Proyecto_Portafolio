package com.proyectoPortafolio.eventout_backend.dto;

/** Respuesta de login/registro: token JWT + perfil del usuario. */
public record AuthResponse(
        String token,
        UsuarioDto usuario
) {
}
