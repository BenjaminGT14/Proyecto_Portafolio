package com.proyectoPortafolio.eventout_backend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.proyectoPortafolio.eventout_backend.dto.VotoDto;
import com.proyectoPortafolio.eventout_backend.dto.request.VotoRequest;
import com.proyectoPortafolio.eventout_backend.model.Resena;
import com.proyectoPortafolio.eventout_backend.model.Usuario;
import com.proyectoPortafolio.eventout_backend.model.VotoResena;
import com.proyectoPortafolio.eventout_backend.repository.ResenaRepository;
import com.proyectoPortafolio.eventout_backend.repository.UsuarioRepository;
import com.proyectoPortafolio.eventout_backend.repository.VotoResenaRepository;
import com.proyectoPortafolio.eventout_backend.service.VotoService;

@ExtendWith(MockitoExtension.class)
class VotoServiceTest {

    @Mock VotoResenaRepository votoRepository;
    @Mock ResenaRepository resenaRepository;
    @Mock UsuarioRepository usuarioRepository;
    @InjectMocks VotoService service;

    private VotoResena votoExistente(boolean esPositivo) {
        return VotoResena.builder().id("v1")
                .usuario(Usuario.builder().id("u1").build())
                .resena(Resena.builder().id("r1").build())
                .esPositivo(esPositivo).build();
    }

    @Test
    void votar_mismoVotoExistente_eliminaYDevuelveNull() {
        VotoResena existente = votoExistente(true);
        when(votoRepository.findByUsuarioIdAndResenaId("u1", "r1"))
                .thenReturn(Optional.of(existente));

        VotoDto res = service.votar("u1", new VotoRequest("r1", true));

        assertThat(res).isNull();
        verify(votoRepository).delete(existente);
        verify(votoRepository, never()).save(any());
    }

    @Test
    void votar_votoContrario_actualizaEsPositivo() {
        VotoResena existente = votoExistente(true);
        when(votoRepository.findByUsuarioIdAndResenaId("u1", "r1"))
                .thenReturn(Optional.of(existente));
        when(votoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        VotoDto res = service.votar("u1", new VotoRequest("r1", false));

        assertThat(res.esPositivo()).isFalse();
        assertThat(existente.getEsPositivo()).isFalse();
        verify(votoRepository, never()).delete(any());
    }
}
