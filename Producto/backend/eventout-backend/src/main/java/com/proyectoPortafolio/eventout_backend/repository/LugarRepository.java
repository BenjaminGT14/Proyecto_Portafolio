package com.proyectoPortafolio.eventout_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.proyectoPortafolio.eventout_backend.model.Lugar;

public interface LugarRepository
        extends JpaRepository<Lugar, String>, JpaSpecificationExecutor<Lugar> {
}
