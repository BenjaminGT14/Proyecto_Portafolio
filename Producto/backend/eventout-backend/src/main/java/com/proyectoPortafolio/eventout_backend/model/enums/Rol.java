package com.proyectoPortafolio.eventout_backend.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Rol de un usuario. En JSON se serializa en minúsculas ("user"/"admin")
 * para mantener el contrato que ya usaba el frontend (profile.rol === 'admin').
 */
public enum Rol {
    USER("user"),
    ADMIN("admin");

    private final String value;

    Rol(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static Rol from(String raw) {
        if (raw == null) return null;
        for (Rol r : values()) {
            if (r.value.equalsIgnoreCase(raw) || r.name().equalsIgnoreCase(raw)) {
                return r;
            }
        }
        throw new IllegalArgumentException("Rol inválido: " + raw);
    }
}
