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
 * Favorito de un usuario hacia un lugar XOR un evento.
 * La regla XOR se valida en el service.
 */
@Entity
@Table(
        name = "favorito",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_fav_usuario_lugar", columnNames = {"id_usuario", "id_lugar"}),
                @UniqueConstraint(name = "uk_fav_usuario_evento", columnNames = {"id_usuario", "id_evento"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Favorito {

    @Id
    @Column(name = "id_favorito", length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lugar")
    private Lugar lugar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_evento")
    private Evento evento;

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
    }
}
