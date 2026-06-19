package com.proyectoPortafolio.eventout_backend.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Estado de aprobación de un evento.
 * - APROBADO: visible públicamente (eventos creados por admin o propuestas aceptadas).
 * - PENDIENTE: propuesta de un usuario a la espera de revisión del admin.
 * - RECHAZADO: propuesta descartada por el admin.
 * En JSON se serializa en minúsculas ("aprobado"/"pendiente"/"rechazado").
 */
public enum EstadoEvento {
    PENDIENTE("pendiente"),
    APROBADO("aprobado"),
    RECHAZADO("rechazado");

    private final String value;

    EstadoEvento(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static EstadoEvento from(String raw) {
        if (raw == null) return null;
        for (EstadoEvento e : values()) {
            if (e.value.equalsIgnoreCase(raw) || e.name().equalsIgnoreCase(raw)) {
                return e;
            }
        }
        throw new IllegalArgumentException("Estado de evento inválido: " + raw);
    }
}
