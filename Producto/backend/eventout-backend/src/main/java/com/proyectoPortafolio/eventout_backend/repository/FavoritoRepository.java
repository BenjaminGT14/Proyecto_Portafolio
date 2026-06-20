package com.proyectoPortafolio.eventout_backend.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.proyectoPortafolio.eventout_backend.model.Favorito;

public interface FavoritoRepository extends JpaRepository<Favorito, String> {

    List<Favorito> findByUsuarioIdAndLugarIsNotNull(String usuarioId);

    List<Favorito> findByUsuarioIdAndEventoIsNotNull(String usuarioId);

    Optional<Favorito> findByUsuarioIdAndLugarId(String usuarioId, String lugarId);

    Optional<Favorito> findByUsuarioIdAndEventoId(String usuarioId, String eventoId);

    List<Favorito> findByUsuarioIdAndLugarIdIn(String usuarioId, Collection<String> lugarIds);

    List<Favorito> findByUsuarioIdAndEventoIdIn(String usuarioId, Collection<String> eventoIds);
}
