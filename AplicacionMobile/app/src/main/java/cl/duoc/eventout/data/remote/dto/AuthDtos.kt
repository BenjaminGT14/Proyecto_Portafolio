package cl.duoc.eventout.data.remote.dto

import com.google.gson.annotations.SerializedName

/** Cuerpo de POST /auth/login */
data class LoginRequest(
    val email: String,
    val password: String
)

/** Cuerpo de POST /auth/register */
data class RegisterRequest(
    val nombre: String,
    val email: String,
    val password: String
)

/** Respuesta de /auth/login y /auth/register: { token, usuario } */
data class AuthResponse(
    val token: String,
    val usuario: UsuarioDto
)

/**
 * Usuario tal como lo serializa el backend (Jackson SNAKE_CASE).
 * Por eso los campos compuestos usan @SerializedName.
 */
data class UsuarioDto(
    @SerializedName("id_usuario") val idUsuario: String,
    val email: String,
    val nombre: String,
    @SerializedName("avatar_url") val avatarUrl: String? = null,
    val rol: String
)

/** Cuerpo de error del backend: { "error": "mensaje" } */
data class ErrorResponse(
    val error: String? = null
)
