package com.proyectoPortafolio.eventout_backend.model;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Voto (positivo/negativo) de un usuario sobre una reseña.
 * Único por (usuario, reseña).
 */
@Entity
@Table(
        name = "voto_resena",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_voto_usuario_resena",
                columnNames = {"id_usuario", "id_resena"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VotoResena {

    @Id
    @Column(name = "id_voto", length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_resena")
    private Resena resena;

    @Column(name = "es_positivo", nullable = false)
    private Boolean esPositivo;

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
    }
}
