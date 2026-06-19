package com.proyectoPortafolio.eventout_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.proyectoPortafolio.eventout_backend.model.Resena;
import com.proyectoPortafolio.eventout_backend.model.enums.EstadoResena;

public interface ResenaRepository extends JpaRepository<Resena, String> {

    List<Resena> findByLugarIdAndEstado(String lugarId, EstadoResena estado);

    List<Resena> findByEventoIdAndEstado(String eventoId, EstadoResena estado);

    List<Resena> findAllByOrderByCreatedAtDesc();
}
