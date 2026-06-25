package com.proyectoPortafolio.eventout_backend.validation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

/**
 * Validación de coherencia de fechas de un evento (a nivel de clase, porque
 * compara dos campos): la fecha de inicio es obligatoria y no puede estar en el
 * pasado, y la fecha de término —si se indica— debe ser estrictamente posterior
 * a la de inicio. La comparación usa la zona horaria del negocio (Chile).
 */
@Documented
@Constraint(validatedBy = FechasEventoValidator.class)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface FechasEventoValidas {
    String message() default "Fechas del evento inválidas";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
