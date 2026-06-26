package com.proyectoPortafolio.eventout_backend.validation;

import java.time.LocalDateTime;
import java.time.ZoneId;

import com.proyectoPortafolio.eventout_backend.dto.request.EventoRequest;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Implementa {@link FechasEventoValidas}. Cada violación se asocia al campo
 * correspondiente (fechaInicio / fechaFin) para que el frontend reciba el error
 * en el campo correcto y el GlobalExceptionHandler devuelva el mensaje concreto.
 */
public class FechasEventoValidator implements ConstraintValidator<FechasEventoValidas, EventoRequest> {

    /** Zona horaria del negocio: define cuándo es "ahora" para el usuario chileno. */
    private static final ZoneId ZONA = ZoneId.of("America/Santiago");

    /** Tolerancia para no rechazar un inicio "ahora mismo" por el desfase del envío. */
    private static final long TOLERANCIA_MINUTOS = 1;

    @Override
    public boolean isValid(EventoRequest req, ConstraintValidatorContext ctx) {
        if (req == null) return true; // @NotNull del body se valida en otro punto.

        LocalDateTime inicio = req.fechaInicio();
        LocalDateTime fin = req.fechaFin();
        boolean valido = true;

        ctx.disableDefaultConstraintViolation();

        if (inicio == null) {
            agregarError(ctx, "fechaInicio", "La fecha de inicio es obligatoria");
            return false; // sin inicio no tiene sentido seguir comparando
        }

        LocalDateTime ahora = LocalDateTime.now(ZONA).minusMinutes(TOLERANCIA_MINUTOS);
        if (inicio.isBefore(ahora)) {
            agregarError(ctx, "fechaInicio", "La fecha de inicio no puede estar en el pasado");
            valido = false;
        }

        if (fin != null && !fin.isAfter(inicio)) {
            agregarError(ctx, "fechaFin", "La fecha de término debe ser posterior a la de inicio");
            valido = false;
        }

        return valido;
    }

    private void agregarError(ConstraintValidatorContext ctx, String campo, String mensaje) {
        ctx.buildConstraintViolationWithTemplate(mensaje)
                .addPropertyNode(campo)
                .addConstraintViolation();
    }
}
