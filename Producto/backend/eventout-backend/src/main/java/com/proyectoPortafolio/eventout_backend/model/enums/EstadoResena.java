package com.proyectoPortafolio.eventout_backend.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Estado de moderación de una reseña. En JSON se serializa en minúsculas
 * ("visible"/"oculta"/"eliminada") para coincidir con el frontend.
 */
public enum EstadoResena {
    VISIBLE("visible"),
    OCULTA("oculta"),
    ELIMINADA("eliminada");

    private final String value;

    EstadoResena(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static EstadoResena from(String raw) {
        if (raw == null) return null;
        for (EstadoResena e : values()) {
            if (e.value.equalsIgnoreCase(raw) || e.name().equalsIgnoreCase(raw)) {
                return e;
            }
        }
        throw new IllegalArgumentException("Estado inválido: " + raw);
    }
}
