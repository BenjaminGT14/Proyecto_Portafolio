package com.proyectoPortafolio.eventout_backend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.proyectoPortafolio.eventout_backend.dto.ResenaDto;
import com.proyectoPortafolio.eventout_backend.dto.request.ResenaRequest;
import com.proyectoPortafolio.eventout_backend.model.Lugar;
import com.proyectoPortafolio.eventout_backend.model.Resena;
import com.proyectoPortafolio.eventout_backend.model.Usuario;
import com.proyectoPortafolio.eventout_backend.model.enums.EstadoResena;
import com.proyectoPortafolio.eventout_backend.repository.EventoRepository;
import com.proyectoPortafolio.eventout_backend.repository.LugarRepository;
import com.proyectoPortafolio.eventout_backend.repository.ResenaRepository;
import com.proyectoPortafolio.eventout_backend.repository.UsuarioRepository;
import com.proyectoPortafolio.eventout_backend.repository.VotoResenaRepository;
import com.proyectoPortafolio.eventout_backend.service.ResenaService;

@ExtendWith(MockitoExtension.class)
class ResenaServiceTest {

    @Mock ResenaRepository resenaRepository;
    @Mock VotoResenaRepository votoRepository;
    @Mock UsuarioRepository usuarioRepository;
    @Mock LugarRepository lugarRepository;
    @Mock EventoRepository eventoRepository;
    @InjectMocks ResenaService service;

    private Resena resena(String id, Usuario u) {
        return Resena.builder().id(id).usuario(u).titulo("t").contenido("c")
                .puntuacion(5).estado(EstadoResena.VISIBLE).createdAt(Instant.now()).build();
    }

    @Test
    void publicar_lugar_creaResenaVisible() {
        Usuario u = Usuario.builder().id("u1").build();
        when(usuarioRepository.findById("u1")).thenReturn(Optional.of(u));
        when(lugarRepository.findById("l1")).thenReturn(Optional.of(Lugar.builder().id("l1").build()));
        when(resenaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ResenaDto res = service.publicar("u1", new ResenaRequest("l1", null, "Titulo", "Cuerpo", 4));

        assertThat(res.estado()).isEqualTo(EstadoResena.VISIBLE);
        assertThat(res.idLugar()).isEqualTo("l1");
        assertThat(res.idUsuario()).isEqualTo("u1");
        assertThat(res.puntuacion()).isEqualTo(4);
    }

    @Test
    void listarPublicas_ordenaPorScoreDescendente() {
        Usuario u = Usuario.builder().id("u1").build();
        Resena baja = resena("rBaja", u);   // score 0
        Resena alta = resena("rAlta", u);   // score 5
        when(resenaRepository.findByLugarIdAndEstado("l1", EstadoResena.VISIBLE))
                .thenReturn(List.of(baja, alta));
        // contarVotosPorResena -> filas [idResena, positivos, negativos]
        when(votoRepository.contarVotosPorResena(any())).thenReturn(List.of(
                new Object[]{"rAlta", 5L, 0L},
                new Object[]{"rBaja", 1L, 1L}));

        List<ResenaDto> res = service.listarPublicas("l1", null);

        assertThat(res).extracting(ResenaDto::idResena).containsExactly("rAlta", "rBaja");
        assertThat(res.get(0).score()).isEqualTo(5);
    }
}
