package com.proyectoPortafolio.eventout_backend.exception;

/** Conflicto de estado (ej. email ya registrado) -> HTTP 409. */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
