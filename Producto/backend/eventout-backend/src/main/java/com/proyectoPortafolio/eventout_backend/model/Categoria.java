package com.proyectoPortafolio.eventout_backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Categoría de un lugar. La PK es de texto (ej. "cat-parque"), igual que en
 * los datos originales del frontend; no se autogenera.
 */
@Entity
@Table(name = "categoria")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Categoria {

    @Id
    @Column(name = "id_categoria", length = 64)
    private String id;

    @Column(nullable = false)
    private String nombre;

    private String icono;
}
