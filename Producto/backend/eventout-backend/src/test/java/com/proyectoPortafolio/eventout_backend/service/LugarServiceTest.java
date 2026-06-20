package com.proyectoPortafolio.eventout_backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.proyectoPortafolio.eventout_backend.dto.LugarDto;
import com.proyectoPortafolio.eventout_backend.dto.request.LugarRequest;
import com.proyectoPortafolio.eventout_backend.exception.NotFoundException;
import com.proyectoPortafolio.eventout_backend.repository.CategoriaRepository;
import com.proyectoPortafolio.eventout_backend.repository.LugarRepository;

@ExtendWith(MockitoExtension.class)
class LugarServiceTest {

    @Mock LugarRepository lugarRepository;
    @Mock CategoriaRepository categoriaRepository;
    @InjectMocks LugarService service;

    private LugarRequest req(Boolean esGratuito, String idCategoria) {
        return new LugarRequest("Lugar", "desc", "dir", "comuna", idCategoria,
                esGratuito, null, null, null, null, null, null);
    }

    @Test
    void obtener_inexistente_lanzaNotFound() {
        when(lugarRepository.findById("l1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.obtener("l1")).isInstanceOf(NotFoundException.class);
    }

    @Test
    void actualizar_inexistente_lanzaNotFound() {
        when(lugarRepository.findById("l1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.actualizar("l1", req(true, null)))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void eliminar_inexistente_lanzaNotFound() {
        when(lugarRepository.existsById("l1")).thenReturn(false);

        assertThatThrownBy(() -> service.eliminar("l1")).isInstanceOf(NotFoundException.class);
    }

    @Test
    void eliminar_existente_borra() {
        when(lugarRepository.existsById("l1")).thenReturn(true);

        service.eliminar("l1");

        verify(lugarRepository).deleteById("l1");
    }

    @Test
    void crear_esGratuitoNull_defaultTrue() {
        when(lugarRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        LugarDto res = service.crear(req(null, null));

        assertThat(res.esGratuito()).isTrue();
    }

    @Test
    void crear_categoriaInexistente_lanzaNotFound() {
        when(categoriaRepository.findById("c1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.crear(req(true, "c1")))
                .isInstanceOf(NotFoundException.class);
    }
}
