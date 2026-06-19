package com.proyectoPortafolio.eventout_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.proyectoPortafolio.eventout_backend.model.Evento;

public interface EventoRepository
        extends JpaRepository<Evento, String>, JpaSpecificationExecutor<Evento> {
}
