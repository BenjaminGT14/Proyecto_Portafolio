package com.proyectoPortafolio.eventout_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyectoPortafolio.eventout_backend.dto.CategoriaDto;
import com.proyectoPortafolio.eventout_backend.mapper.DtoMapper;
import com.proyectoPortafolio.eventout_backend.repository.CategoriaRepository;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoriaDto> listar() {
        return categoriaRepository.findAllByOrderByNombreAsc()
                .stream()
                .map(DtoMapper::toCategoriaDto)
                .toList();
    }
}
