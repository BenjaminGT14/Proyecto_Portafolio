package com.proyectoPortafolio.eventout_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.proyectoPortafolio.eventout_backend.dto.ApiError;

/**
 * Traduce excepciones a respuestas JSON { "error": "..." } con el status
 * adecuado, manteniendo el contrato que el frontend ya leía (json.error).
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(NotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiError> handleBadRequest(BadRequestException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiError> handleConflict(ConflictException ex) {
        return build(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiError> handleUnauthorized(UnauthorizedException ex) {
        return build(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        // Preferimos el error de campo; si la violación es de clase (p. ej. la
        // coherencia de fechas), caemos al error global antes que a un genérico.
        FieldError fieldError = ex.getBindingResult().getFieldError();
        String mensaje;
        if (fieldError != null) {
            mensaje = fieldError.getDefaultMessage();
        } else if (ex.getBindingResult().getGlobalError() != null) {
            mensaje = ex.getBindingResult().getGlobalError().getDefaultMessage();
        } else {
            mensaje = "Datos inválidos";
        }
        return build(HttpStatus.BAD_REQUEST, mensaje);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor");
    }

    private ResponseEntity<ApiError> build(HttpStatus status, String mensaje) {
        return ResponseEntity.status(status).body(new ApiError(mensaje));
    }
}
