package com.proyectoPortafolio.eventout_backend.security;

import com.proyectoPortafolio.eventout_backend.model.enums.Rol;

/**
 * Principal autenticado que viaja en el SecurityContext. Se construye a partir
 * de los claims del JWT, sin volver a consultar la base de datos en cada request.
 * Los controladores lo reciben con @AuthenticationPrincipal AuthUser.
 */
public record AuthUser(String id, String email, Rol rol) {
}
