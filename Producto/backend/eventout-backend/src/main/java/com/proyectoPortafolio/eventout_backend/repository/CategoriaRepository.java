package com.proyectoPortafolio.eventout_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.proyectoPortafolio.eventout_backend.model.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, String> {

    List<Categoria> findAllByOrderByNombreAsc();
}
