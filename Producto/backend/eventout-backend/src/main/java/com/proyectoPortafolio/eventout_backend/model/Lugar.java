package com.proyectoPortafolio.eventout_backend.model;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "lugar")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lugar {

    @Id
    @Column(name = "id_lugar", length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria")
    private Categoria categoria;

    @Column(nullable = false)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private String direccion;

    private String comuna;

    private Double latitud;

    private Double longitud;

    @Column(name = "es_gratuito")
    @Builder.Default
    private Boolean esGratuito = true;

    private Double precio;

    private String horario;

    @Column(name = "imagen_url", length = 1000)
    private String imagenUrl;

    @Column(name = "wikipedia_slug")
    private String wikipediaSlug;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
        if (createdAt == null) createdAt = Instant.now();
        if (esGratuito == null) esGratuito = true;
    }
}
