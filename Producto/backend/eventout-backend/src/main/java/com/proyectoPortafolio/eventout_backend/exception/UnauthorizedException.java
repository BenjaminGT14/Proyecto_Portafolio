package com.proyectoPortafolio.eventout_backend.exception;

/** Credenciales inválidas -> HTTP 401. */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
