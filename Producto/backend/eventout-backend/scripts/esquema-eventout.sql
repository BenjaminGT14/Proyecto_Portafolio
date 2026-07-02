-- =============================================================================
-- EventOut — Esquema completo de la base de datos (MySQL 8)
-- =============================================================================
-- Script DDL de la base `eventout_db`: crea todas las tablas, claves primarias,
-- claves foráneas (relaciones) y restricciones únicas.
--
-- Normalmente este esquema lo genera Hibernate automáticamente al arrancar el
-- backend (spring.jpa.hibernate.ddl-auto=update). Este archivo reproduce ese
-- mismo esquema para poder crear la BD a mano (p. ej. para el informe / Anexo E
-- o para inicializar la base sin levantar la aplicación).
--
-- Verificado contra el esquema real generado por Hibernate (charset utf8mb4).
-- Las tablas se crean en orden de dependencia para que las FK resuelvan.
-- Los datos iniciales (categorías, lugares, eventos, usuarios, reseñas, votos)
-- los siembra la clase DataInitializer del backend; este script solo crea la
-- estructura.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS eventout_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE eventout_db;

-- --- Limpieza opcional (re-ejecutable): descomentar para recrear desde cero ---
-- SET FOREIGN_KEY_CHECKS = 0;
-- DROP TABLE IF EXISTS favorito;
-- DROP TABLE IF EXISTS voto_resena;
-- DROP TABLE IF EXISTS resena;
-- DROP TABLE IF EXISTS evento;
-- DROP TABLE IF EXISTS lugar;
-- DROP TABLE IF EXISTS usuario;
-- DROP TABLE IF EXISTS categoria;
-- SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 1) CATEGORIA  — clasificación de lugares (PK de texto, ej. 'cat-parque')
-- =============================================================================
CREATE TABLE categoria (
  id_categoria  VARCHAR(64)  NOT NULL,
  nombre        VARCHAR(255) NOT NULL,
  icono         VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id_categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =============================================================================
-- 2) USUARIO  — cuentas (email único; password_hash con BCrypt)
-- =============================================================================
CREATE TABLE usuario (
  id_usuario     VARCHAR(36)               NOT NULL,
  email          VARCHAR(255)              NOT NULL,
  password_hash  VARCHAR(255)              NOT NULL,
  nombre         VARCHAR(255)              NOT NULL,
  avatar_url     VARCHAR(1000)             DEFAULT NULL,
  rol            ENUM('ADMIN','USER')      NOT NULL,
  estado         ENUM('ACTIVO','BLOQUEADO') NOT NULL,
  created_at     DATETIME(6)               DEFAULT NULL,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uk_usuario_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =============================================================================
-- 3) LUGAR  — puntos fijos de interés (FK -> categoria)
-- =============================================================================
CREATE TABLE lugar (
  id_lugar        VARCHAR(36)   NOT NULL,
  id_categoria    VARCHAR(64)   DEFAULT NULL,
  nombre          VARCHAR(255)  NOT NULL,
  descripcion     TEXT,
  direccion       VARCHAR(255)  DEFAULT NULL,
  comuna          VARCHAR(255)  DEFAULT NULL,
  latitud         DOUBLE        DEFAULT NULL,
  longitud        DOUBLE        DEFAULT NULL,
  es_gratuito     BIT(1)        DEFAULT NULL,
  precio          DOUBLE        DEFAULT NULL,
  horario         VARCHAR(255)  DEFAULT NULL,
  imagen_url      VARCHAR(1000) DEFAULT NULL,
  wikipedia_slug  VARCHAR(255)  DEFAULT NULL,
  created_at      DATETIME(6)   DEFAULT NULL,
  PRIMARY KEY (id_lugar),
  KEY idx_lugar_categoria (id_categoria),
  CONSTRAINT fk_lugar_categoria
    FOREIGN KEY (id_categoria) REFERENCES categoria (id_categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =============================================================================
-- 4) EVENTO  — actividades con fecha (FK -> lugar; FK -> usuario que propone)
--    estado: APROBADO (admin/sembrados) / PENDIENTE / RECHAZADO (propuestas)
-- =============================================================================
CREATE TABLE evento (
  id_evento           VARCHAR(36)   NOT NULL,
  id_lugar            VARCHAR(36)   DEFAULT NULL,
  id_usuario_propuso  VARCHAR(36)   DEFAULT NULL,
  nombre              VARCHAR(255)  NOT NULL,
  descripcion         TEXT,
  fecha_inicio        DATETIME(6)   DEFAULT NULL,
  fecha_fin           DATETIME(6)   DEFAULT NULL,
  es_gratuito         BIT(1)        DEFAULT NULL,
  precio              DOUBLE        DEFAULT NULL,
  imagen_url          VARCHAR(1000) DEFAULT NULL,
  estado              ENUM('APROBADO','PENDIENTE','RECHAZADO') NOT NULL,
  created_at          DATETIME(6)   DEFAULT NULL,
  PRIMARY KEY (id_evento),
  KEY idx_evento_lugar (id_lugar),
  KEY idx_evento_usuario_propuso (id_usuario_propuso),
  CONSTRAINT fk_evento_lugar
    FOREIGN KEY (id_lugar) REFERENCES lugar (id_lugar),
  CONSTRAINT fk_evento_usuario_propuso
    FOREIGN KEY (id_usuario_propuso) REFERENCES usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =============================================================================
-- 5) RESENA  — opinión sobre un lugar XOR un evento (regla XOR validada en el
--    backend). estado: VISIBLE / OCULTA / ELIMINADA (moderación)
-- =============================================================================
CREATE TABLE resena (
  id_resena   VARCHAR(36)  NOT NULL,
  id_usuario  VARCHAR(36)  NOT NULL,
  id_lugar    VARCHAR(36)  DEFAULT NULL,
  id_evento   VARCHAR(36)  DEFAULT NULL,
  titulo      VARCHAR(255) DEFAULT NULL,
  contenido   TEXT,
  puntuacion  INT          DEFAULT NULL,
  estado      ENUM('ELIMINADA','OCULTA','VISIBLE') NOT NULL,
  created_at  DATETIME(6)  DEFAULT NULL,
  PRIMARY KEY (id_resena),
  KEY idx_resena_usuario (id_usuario),
  KEY idx_resena_lugar (id_lugar),
  KEY idx_resena_evento (id_evento),
  CONSTRAINT fk_resena_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario),
  CONSTRAINT fk_resena_lugar
    FOREIGN KEY (id_lugar) REFERENCES lugar (id_lugar),
  CONSTRAINT fk_resena_evento
    FOREIGN KEY (id_evento) REFERENCES evento (id_evento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =============================================================================
-- 6) VOTO_RESENA  — voto (positivo/negativo) de un usuario sobre una reseña.
--    Único por (usuario, reseña).
-- =============================================================================
CREATE TABLE voto_resena (
  id_voto      VARCHAR(36) NOT NULL,
  id_usuario   VARCHAR(36) NOT NULL,
  id_resena    VARCHAR(36) NOT NULL,
  es_positivo  BIT(1)      NOT NULL,
  PRIMARY KEY (id_voto),
  UNIQUE KEY uk_voto_usuario_resena (id_usuario, id_resena),
  KEY idx_voto_resena (id_resena),
  CONSTRAINT fk_voto_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario),
  CONSTRAINT fk_voto_resena
    FOREIGN KEY (id_resena) REFERENCES resena (id_resena)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =============================================================================
-- 7) FAVORITO  — lugar XOR evento guardado por un usuario.
--    Único por (usuario, lugar) y por (usuario, evento).
-- =============================================================================
CREATE TABLE favorito (
  id_favorito  VARCHAR(36) NOT NULL,
  id_usuario   VARCHAR(36) NOT NULL,
  id_lugar     VARCHAR(36) DEFAULT NULL,
  id_evento    VARCHAR(36) DEFAULT NULL,
  PRIMARY KEY (id_favorito),
  UNIQUE KEY uk_fav_usuario_lugar (id_usuario, id_lugar),
  UNIQUE KEY uk_fav_usuario_evento (id_usuario, id_evento),
  KEY idx_fav_lugar (id_lugar),
  KEY idx_fav_evento (id_evento),
  CONSTRAINT fk_fav_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario),
  CONSTRAINT fk_fav_lugar
    FOREIGN KEY (id_lugar) REFERENCES lugar (id_lugar),
  CONSTRAINT fk_fav_evento
    FOREIGN KEY (id_evento) REFERENCES evento (id_evento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =============================================================================
-- Resumen de relaciones (claves foráneas):
--   lugar.id_categoria          -> categoria.id_categoria
--   evento.id_lugar             -> lugar.id_lugar
--   evento.id_usuario_propuso   -> usuario.id_usuario
--   resena.id_usuario           -> usuario.id_usuario   (obligatoria)
--   resena.id_lugar             -> lugar.id_lugar       (XOR con id_evento)
--   resena.id_evento            -> evento.id_evento     (XOR con id_lugar)
--   voto_resena.id_usuario      -> usuario.id_usuario
--   voto_resena.id_resena       -> resena.id_resena
--   favorito.id_usuario         -> usuario.id_usuario
--   favorito.id_lugar           -> lugar.id_lugar       (XOR con id_evento)
--   favorito.id_evento          -> evento.id_evento     (XOR con id_lugar)
-- =============================================================================
