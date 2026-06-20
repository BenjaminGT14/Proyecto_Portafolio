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

import com.proyectoPortafolio.eventout_backend.dto.VotoDto;
import com.proyectoPortafolio.eventout_backend.dto.request.VotoRequest;
import com.proyectoPortafolio.eventout_backend.exception.NotFoundException;
import com.proyectoPortafolio.eventout_backend.model.Resena;
import com.proyectoPortafolio.eventout_backend.model.Usuario;
import com.proyectoPortafolio.eventout_backend.model.VotoResena;
import com.proyectoPortafolio.eventout_backend.repository.ResenaRepository;
import com.proyectoPortafolio.eventout_backend.repository.UsuarioRepository;
import com.proyectoPortafolio.eventout_backend.repository.VotoResenaRepository;

@ExtendWith(MockitoExtension.class)
class VotoServiceTest {

    @Mock VotoResenaRepository votoRepository;
    @Mock ResenaRepository resenaRepository;
    @Mock UsuarioRepository usuarioRepository;
    @InjectMocks VotoService service;

    private Usuario usuario() { return Usuario.builder().id("u1").build(); }
    private Resena resena() { return Resena.builder().id("r1").build(); }

    @Test
    void votar_mismoVotoExistente_eliminaYDevuelveNull() {
        VotoResena existente = VotoResena.builder().id("v1")
                .usuario(usuario()).resena(resena()).esPositivo(true).build();
        when(votoRepository.findByUsuarioIdAndResenaId("u1", "r1"))
                .thenReturn(Optional.of(existente));

        VotoDto res = service.votar("u1", new VotoRequest("r1", true));

        assertThat(res).isNull();
        verify(votoRepository).delete(existente);
        verify(votoRepository, never()).save(any());
    }

    @Test
    void votar_votoContrario_actualizaEsPositivo() {
        VotoResena existente = VotoResena.builder().id("v1")
                .usuario(usuario()).resena(resena()).esPositivo(true).build();
        when(votoRepository.findByUsuarioIdAndResenaId("u1", "r1"))
                .thenReturn(Optional.of(existente));
        when(votoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        VotoDto res = service.votar("u1", new VotoRequest("r1", false));

        assertThat(res).isNotNull();
        assertThat(res.esPositivo()).isFalse();
        assertThat(existente.getEsPositivo()).isFalse();
        verify(votoRepository, never()).delete(any());
    }

    @Test
    void votar_sinVotoPrevio_usuarioInexistente_lanzaNotFound() {
        when(votoRepository.findByUsuarioIdAndResenaId("u1", "r1")).thenReturn(Optional.empty());
        when(usuarioRepository.findById("u1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.votar("u1", new VotoRequest("r1", true)))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void votar_sinVotoPrevio_resenaInexistente_lanzaNotFound() {
        when(votoRepository.findByUsuarioIdAndResenaId("u1", "r1")).thenReturn(Optional.empty());
        when(usuarioRepository.findById("u1")).thenReturn(Optional.of(usuario()));
        when(resenaRepository.findById("r1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.votar("u1", new VotoRequest("r1", true)))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void votar_sinVotoPrevio_creaVoto() {
        when(votoRepository.findByUsuarioIdAndResenaId("u1", "r1")).thenReturn(Optional.empty());
        when(usuarioRepository.findById("u1")).thenReturn(Optional.of(usuario()));
        when(resenaRepository.findById("r1")).thenReturn(Optional.of(resena()));
        when(votoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        VotoDto res = service.votar("u1", new VotoRequest("r1", true));

        assertThat(res.idUsuario()).isEqualTo("u1");
        assertThat(res.idResena()).isEqualTo("r1");
        assertThat(res.esPositivo()).isTrue();
    }

    @Test
    void votosDelUsuario_coleccionVacia_devuelveListaVacia() {
        assertThat(service.votosDelUsuario("u1", List.of())).isEmpty();
        assertThat(service.votosDelUsuario("u1", null)).isEmpty();
        verify(votoRepository, never()).findByUsuarioIdAndResenaIdIn(any(), any());
    }
}
