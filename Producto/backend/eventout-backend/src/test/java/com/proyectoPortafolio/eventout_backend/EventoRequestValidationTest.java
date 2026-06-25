package com.proyectoPortafolio.eventout_backend;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.Set;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import com.proyectoPortafolio.eventout_backend.dto.request.EventoRequest;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

/**
 * Verifica la validación de coherencia de fechas (FechasEventoValidas) y los
 * límites de longitud del DTO EventoRequest, usando Hibernate Validator.
 */
class EventoRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    private EventoRequest evento(LocalDateTime inicio, LocalDateTime fin) {
        return new EventoRequest("Evento", "desc", null, inicio, fin, true, null, null);
    }

    @Test
    void fechaInicioEnPasado_esInvalida() {
        Set<ConstraintViolation<EventoRequest>> v =
                validator.validate(evento(LocalDateTime.now().minusDays(1), null));
        assertThat(v).isNotEmpty();
    }

    @Test
    void fechaFinAntesDeInicio_esInvalida() {
        LocalDateTime inicio = LocalDateTime.now().plusDays(2);
        Set<ConstraintViolation<EventoRequest>> v =
                validator.validate(evento(inicio, inicio.minusHours(1)));
        assertThat(v).isNotEmpty();
    }

    @Test
    void fechasCoherentes_sonValidas() {
        LocalDateTime inicio = LocalDateTime.now().plusDays(2);
        Set<ConstraintViolation<EventoRequest>> v =
                validator.validate(evento(inicio, inicio.plusHours(2)));
        assertThat(v).isEmpty();
    }

    @Test
    void nombreDemasiadoLargo_esInvalido() {
        LocalDateTime inicio = LocalDateTime.now().plusDays(2);
        EventoRequest req = new EventoRequest("N".repeat(151), null, null, inicio, null, true, null, null);
        assertThat(validator.validate(req)).isNotEmpty();
    }
}
