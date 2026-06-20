package com.proyectoPortafolio.eventout_backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import com.proyectoPortafolio.eventout_backend.dto.EventoDto;
import com.proyectoPortafolio.eventout_backend.dto.request.EventoRequest;
import com.proyectoPortafolio.eventout_backend.exception.BadRequestException;
import com.proyectoPortafolio.eventout_backend.exception.NotFoundException;
import com.proyectoPortafolio.eventout_backend.model.Evento;
import com.proyectoPortafolio.eventout_backend.model.Usuario;
import com.proyectoPortafolio.eventout_backend.model.enums.EstadoEvento;
import com.proyectoPortafolio.eventout_backend.repository.EventoRepository;
import com.proyectoPortafolio.eventout_backend.repository.LugarRepository;
import com.proyectoPortafolio.eventout_backend.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class EventoServiceTest {

    @Mock EventoRepository eventoRepository;
    @Mock LugarRepository lugarRepository;
    @Mock UsuarioRepository usuarioRepository;
    @InjectMocks EventoService service;

    private EventoRequest req(Boolean esGratuito) {
        return new EventoRequest("Evento", "desc", null, null, null, esGratuito, null, null);
    }

    // ---- parseDesde (vía listar) ------------------------------------------

    @Test
    void listar_desdeIsoDateTime_parsea() {
        when(eventoRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of());

        assertThat(service.listar(null, null, null, "2026-01-01T10:00:00")).isEmpty();
    }

    @Test
    void listar_desdeIsoDate_parsea() {
        when(eventoRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of());

        assertThat(service.listar(null, null, null, "2026-01-01")).isEmpty();
    }

    @Test
    void listar_desdeInvalido_lanzaBadRequest() {
        assertThatThrownBy(() -> service.listar(null, null, null, "no-es-fecha"))
                .isInstanceOf(BadRequestException.class);
    }

    // ---- obtener ----------------------------------------------------------

    @Test
    void obtener_noAprobado_lanzaNotFound() {
        Evento pendiente = Evento.builder().id("e1").nombre("x").estado(EstadoEvento.PENDIENTE).build();
        when(eventoRepository.findById("e1")).thenReturn(Optional.of(pendiente));

        assertThatThrownBy(() -> service.obtener("e1")).isInstanceOf(NotFoundException.class);
    }

    // ---- crear / proponer -------------------------------------------------

    @Test
    void crear_dejaEstadoAprobado() {
        when(eventoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EventoDto res = service.crear(req(true));

        assertThat(res.estado()).isEqualTo(EstadoEvento.APROBADO);
    }

    @Test
    void crear_esGratuitoNull_defaultTrue() {
        when(eventoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EventoDto res = service.crear(req(null));

        assertThat(res.esGratuito()).isTrue();
    }

    @Test
    void proponer_usuarioInexistente_lanzaNotFound() {
        when(usuarioRepository.findById("u1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.proponer("u1", req(true)))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void proponer_dejaEstadoPendiente() {
        when(usuarioRepository.findById("u1")).thenReturn(Optional.of(Usuario.builder().id("u1").build()));
        when(eventoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EventoDto res = service.proponer("u1", req(true));

        assertThat(res.estado()).isEqualTo(EstadoEvento.PENDIENTE);
    }

    // ---- cambiarEstado / actualizar / eliminar ----------------------------

    @Test
    void cambiarEstado_inexistente_lanzaNotFound() {
        when(eventoRepository.findById("e1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.cambiarEstado("e1", EstadoEvento.APROBADO))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void actualizar_inexistente_lanzaNotFound() {
        when(eventoRepository.findById("e1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.actualizar("e1", req(true)))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void eliminar_inexistente_lanzaNotFound() {
        when(eventoRepository.existsById("e1")).thenReturn(false);

        assertThatThrownBy(() -> service.eliminar("e1")).isInstanceOf(NotFoundException.class);
    }

    @Test
    void eliminar_existente_borra() {
        when(eventoRepository.existsById("e1")).thenReturn(true);

        service.eliminar("e1");

        verify(eventoRepository).deleteById("e1");
    }
}
