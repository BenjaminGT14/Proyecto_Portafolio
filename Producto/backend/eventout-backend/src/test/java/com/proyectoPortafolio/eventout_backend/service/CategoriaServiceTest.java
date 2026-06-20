package com.proyectoPortafolio.eventout_backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.proyectoPortafolio.eventout_backend.dto.CategoriaDto;
import com.proyectoPortafolio.eventout_backend.model.Categoria;
import com.proyectoPortafolio.eventout_backend.repository.CategoriaRepository;

@ExtendWith(MockitoExtension.class)
class CategoriaServiceTest {

    @Mock CategoriaRepository categoriaRepository;
    @InjectMocks CategoriaService service;

    @Test
    void listar_mapeaCategoriasDelRepo() {
        when(categoriaRepository.findAllByOrderByNombreAsc()).thenReturn(List.of(
                Categoria.builder().id("cat-parque").nombre("Parque").icono("tree").build()));

        List<CategoriaDto> res = service.listar();

        assertThat(res).hasSize(1);
        assertThat(res.get(0).idCategoria()).isEqualTo("cat-parque");
        assertThat(res.get(0).nombre()).isEqualTo("Parque");
    }
}
