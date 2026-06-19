package com.proyectoPortafolio.eventout_backend.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.proyectoPortafolio.eventout_backend.model.VotoResena;

public interface VotoResenaRepository extends JpaRepository<VotoResena, String> {

    Optional<VotoResena> findByUsuarioIdAndResenaId(String usuarioId, String resenaId);

    List<VotoResena> findByUsuarioIdAndResenaIdIn(String usuarioId, Collection<String> resenaIds);

    /**
     * Conteo agregado de votos por reseña. Devuelve filas
     * [idResena (String), positivos (long), negativos (long)].
     */
    @Query("""
            select v.resena.id,
                   sum(case when v.esPositivo = true then 1L else 0L end),
                   sum(case when v.esPositivo = false then 1L else 0L end)
            from VotoResena v
            where v.resena.id in :ids
            group by v.resena.id
            """)
    List<Object[]> contarVotosPorResena(@Param("ids") Collection<String> ids);
}
