package com.proyectoPortafolio.eventout_backend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.proyectoPortafolio.eventout_backend.dto.EventoDto;
import com.proyectoPortafolio.eventout_backend.dto.request.EventoRequest;
import com.proyectoPortafolio.eventout_backend.exception.BadRequestException;
import com.proyectoPortafolio.eventout_backend.model.Usuario;
import com.proyectoPortafolio.eventout_backend.model.enums.EstadoEvento;
import com.proyectoPortafolio.eventout_backend.repository.EventoRepository;
import com.proyectoPortafolio.eventout_backend.repository.LugarRepository;
import com.proyectoPortafolio.eventout_backend.repository.UsuarioRepository;
import com.proyectoPortafolio.eventout_backend.service.EventoService;

@ExtendWith(MockitoExtension.class)
class EventoServiceTest {

    @Mock EventoRepository eventoRepository;
    @Mock LugarRepository lugarRepository;
    @Mock UsuarioRepository usuarioRepository;
    @InjectMocks EventoService service;

    private EventoRequest req() {
        return new EventoRequest("Evento", "desc", null, null, null, true, null, null);
    }

    @Test
    void listar_desdeInvalido_lanzaBadRequest() {
        assertThatThrownBy(() -> service.listar(null, null, null, "no-es-fecha"))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void proponer_dejaEstadoPendiente() {
        when(usuarioRepository.findById("u1")).thenReturn(Optional.of(Usuario.builder().id("u1").build()));
        when(eventoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EventoDto res = service.proponer("u1", req());

        assertThat(res.estado()).isEqualTo(EstadoEvento.PENDIENTE);
    }
}
