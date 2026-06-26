package com.proyectoPortafolio.eventout_backend.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Estado de habilitación de una cuenta de usuario.
 * - ACTIVO: la cuenta puede iniciar sesión y operar normalmente.
 * - BLOQUEADO: la cuenta fue deshabilitada (suspensión/baja). No puede iniciar
 *   sesión y su sesión vigente se invalida en la próxima validación con /auth/me.
 * En JSON se serializa en minúsculas ("activo"/"bloqueado"), igual que el resto
 * de enums del dominio (EstadoEvento, EstadoResena).
 */
public enum EstadoUsuario {
    ACTIVO("activo"),
    BLOQUEADO("bloqueado");

    private final String value;

    EstadoUsuario(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static EstadoUsuario from(String raw) {
        if (raw == null) return null;
        for (EstadoUsuario e : values()) {
            if (e.value.equalsIgnoreCase(raw) || e.name().equalsIgnoreCase(raw)) {
                return e;
            }
        }
        throw new IllegalArgumentException("Estado de usuario inválido: " + raw);
    }
}
