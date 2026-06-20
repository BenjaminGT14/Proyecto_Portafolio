package com.proyectoPortafolio.eventout_backend.model;

import java.time.Instant;
import java.util.UUID;

import com.proyectoPortafolio.eventout_backend.model.enums.EstadoResena;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Reseña de un lugar XOR un evento (exactamente uno de los dos).
 * La regla XOR se valida en el service.
 */
@Entity
@Table(name = "resena")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resena {

    @Id
    @Column(name = "id_resena", length = 36)
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

    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String contenido;

    private Integer puntuacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private EstadoResena estado = EstadoResena.VISIBLE;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
        if (createdAt == null) createdAt = Instant.now();
        if (estado == null) estado = EstadoResena.VISIBLE;
    }
}
