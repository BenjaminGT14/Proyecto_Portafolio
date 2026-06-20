package com.proyectoPortafolio.eventout_backend.model;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

import com.proyectoPortafolio.eventout_backend.model.enums.EstadoEvento;

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

@Entity
@Table(name = "evento")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evento {

    @Id
    @Column(name = "id_evento", length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lugar")
    private Lugar lugar;

    @Column(nullable = false)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Column(name = "es_gratuito")
    @Builder.Default
    private Boolean esGratuito = true;

    private Double precio;

    @Column(name = "imagen_url", length = 1000)
    private String imagenUrl;

    /** Estado de aprobación: APROBADO (admin), PENDIENTE/RECHAZADO (propuestas de usuarios). */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private EstadoEvento estado = EstadoEvento.APROBADO;

    /** Usuario que propuso el evento (null para eventos creados/sembrados por admin). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_propuso")
    private Usuario propuestoPor;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
        if (createdAt == null) createdAt = Instant.now();
        if (esGratuito == null) esGratuito = true;
        if (estado == null) estado = EstadoEvento.APROBADO;
    }
}
