package com.proyectoPortafolio.eventout_backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RecuperarPasswordRequest(
        @NotBlank(message = "El email es obligatorio")
        @Email(message = "Email inválido")
        String email
) {
}
