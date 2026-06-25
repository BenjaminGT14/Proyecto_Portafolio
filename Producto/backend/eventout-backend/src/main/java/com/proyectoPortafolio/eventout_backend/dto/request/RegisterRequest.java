package com.proyectoPortafolio.eventout_backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 80, message = "El nombre no puede superar 80 caracteres")
        String nombre,

        @NotBlank(message = "El email es obligatorio")
        @Email(message = "Email inválido")
        @Size(max = 254, message = "El email no puede superar 254 caracteres")
        String email,

        // min 8: alineado con OWASP ASVS. max 72: BCrypt ignora los bytes que
        // superan ese límite, así que validarlo evita una falsa sensación de
        // contraseña "más larga = más fuerte".
        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
        String password
) {
}
