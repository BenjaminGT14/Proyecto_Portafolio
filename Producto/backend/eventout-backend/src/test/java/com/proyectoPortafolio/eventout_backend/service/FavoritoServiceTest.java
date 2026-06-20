package com.proyectoPortafolio.eventout_backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.proyectoPortafolio.eventout_backend.dto.EstadoFavoritosDto;
import com.proyectoPortafolio.eventout_backend.dto.ToggleResultDto;
import com.proyectoPortafolio.eventout_backend.dto.request.FavoritoToggleRequest;
import com.proyectoPortafolio.eventout_backend.exception.BadRequestException;
import com.proyectoPortafolio.eventout_backend.exception.NotFoundException;
import com.proyectoPortafolio.eventout_backend.model.Favorito;
import com.proyectoPortafolio.eventout_backend.model.Lugar;
import com.proyectoPortafolio.eventout_backend.model.Usuario;
import com.proyectoPortafolio.eventout_backend.repository.EventoRepository;
import com.proyectoPortafolio.eventout_backend.repository.FavoritoRepository;
import com.proyectoPortafolio.eventout_backend.repository.LugarRepository;
import com.proyectoPortafolio.eventout_backend.repository.UsuarioRepository;

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

    @Test
    void toggle_favoritoExistente_eliminaYDevuelveInactivo() {
        Favorito existente = Favorito.builder().id("f1").build();
        when(favoritoRepository.findByUsuarioIdAndLugarId("u1", "l1"))
                .thenReturn(Optional.of(existente));

        ToggleResultDto res = service.toggle("u1", new FavoritoToggleRequest("l1", null));

        assertThat(res.activo()).isFalse();
        verify(favoritoRepository).delete(existente);
        verify(favoritoRepository, never()).save(any());
    }

    @Test
    void toggle_nuevo_usuarioInexistente_lanzaNotFound() {
        when(favoritoRepository.findByUsuarioIdAndLugarId("u1", "l1")).thenReturn(Optional.empty());
        when(usuarioRepository.findById("u1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.toggle("u1", new FavoritoToggleRequest("l1", null)))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void toggle_nuevo_lugarInexistente_lanzaNotFound() {
        when(favoritoRepository.findByUsuarioIdAndLugarId("u1", "l1")).thenReturn(Optional.empty());
        when(usuarioRepository.findById("u1")).thenReturn(Optional.of(Usuario.builder().id("u1").build()));
        when(lugarRepository.findById("l1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.toggle("u1", new FavoritoToggleRequest("l1", null)))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void toggle_nuevoLugar_creaYDevuelveActivo() {
        when(favoritoRepository.findByUsuarioIdAndLugarId("u1", "l1")).thenReturn(Optional.empty());
        when(usuarioRepository.findById("u1")).thenReturn(Optional.of(Usuario.builder().id("u1").build()));
        when(lugarRepository.findById("l1")).thenReturn(Optional.of(Lugar.builder().id("l1").build()));

        ToggleResultDto res = service.toggle("u1", new FavoritoToggleRequest("l1", null));

        assertThat(res.activo()).isTrue();
        verify(favoritoRepository).save(any(Favorito.class));
    }

    @Test
    void estado_listasVacias_devuelveDtoVacio() {
        EstadoFavoritosDto res = service.estado("u1", List.of(), null);

        assertThat(res.lugares()).isEmpty();
        assertThat(res.eventos()).isEmpty();
        verify(favoritoRepository, never()).findByUsuarioIdAndLugarIdIn(any(), any());
        verify(favoritoRepository, never()).findByUsuarioIdAndEventoIdIn(any(), any());
    }
}
