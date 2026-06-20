package com.proyectoPortafolio.eventout_backend.exception;

/** Petición inválida (reglas de negocio) -> HTTP 400. */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
