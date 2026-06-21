package com.proyectoPortafolio.eventout_backend;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.proyectoPortafolio.eventout_backend.dto.request.FavoritoToggleRequest;
import com.proyectoPortafolio.eventout_backend.exception.BadRequestException;
import com.proyectoPortafolio.eventout_backend.repository.EventoRepository;
import com.proyectoPortafolio.eventout_backend.repository.FavoritoRepository;
import com.proyectoPortafolio.eventout_backend.repository.LugarRepository;
import com.proyectoPortafolio.eventout_backend.repository.UsuarioRepository;
import com.proyectoPortafolio.eventout_backend.service.FavoritoService;

@ExtendWith(MockitoExtension.class)
class FavoritoServiceTest {

    @Mock FavoritoRepository favoritoRepository;
    @Mock UsuarioRepository usuarioRepository;
    @Mock LugarRepository lugarRepository;
    @Mock EventoRepository eventoRepository;
    @InjectMocks FavoritoService service;

    @Test
    void toggle_xorInvalido_lanzaBadRequest() {
        // ambos vacíos
        assertThatThrownBy(() -> service.toggle("u1", new FavoritoToggleRequest(null, null)))
                .isInstanceOf(BadRequestException.class);
        // ambos presentes
        assertThatThrownBy(() -> service.toggle("u1", new FavoritoToggleRequest("l1", "e1")))
                .isInstanceOf(BadRequestException.class);
    }
}
