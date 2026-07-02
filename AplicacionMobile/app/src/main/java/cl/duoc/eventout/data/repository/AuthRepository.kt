package cl.duoc.eventout.data.repository

import cl.duoc.eventout.data.local.TokenStore
import cl.duoc.eventout.data.remote.ApiClient
import cl.duoc.eventout.data.remote.AuthApi
import cl.duoc.eventout.data.remote.dto.AuthResponse
import cl.duoc.eventout.data.remote.dto.ErrorResponse
import cl.duoc.eventout.data.remote.dto.LoginRequest
import cl.duoc.eventout.data.remote.dto.RegisterRequest
import com.google.gson.Gson
import retrofit2.Response
import java.io.IOException

/**
 * Orquesta las llamadas de autenticacion: llama a la API, guarda la sesion en TokenStore
 * cuando resulta OK, y traduce los errores del backend ({ "error": "..." }) a mensajes.
 */
class AuthRepository(
    private val api: AuthApi = ApiClient.authApi
) {

    suspend fun login(email: String, password: String): Result<AuthResponse> =
        handleAuth { api.login(LoginRequest(email.trim().lowercase(), password)) }

    suspend fun register(nombre: String, email: String, password: String): Result<AuthResponse> =
        handleAuth { api.register(RegisterRequest(nombre.trim(), email.trim().lowercase(), password)) }

    private suspend fun handleAuth(call: suspend () -> Response<AuthResponse>): Result<AuthResponse> {
        return try {
            val response = call()
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    TokenStore.saveSession(body.token, body.usuario)
                    Result.success(body)
                } else {
                    Result.failure(Exception("Respuesta vacia del servidor"))
                }
            } else {
                Result.failure(Exception(parseError(response)))
            }
        } catch (e: IOException) {
            Result.failure(Exception("No se pudo conectar con el servidor. Revisa tu conexion."))
        } catch (e: Exception) {
            Result.failure(Exception("Ocurrio un error inesperado: ${e.message}"))
        }
    }

    private fun parseError(response: Response<*>): String {
        val raw = response.errorBody()?.string()
        val fallback = "Error ${response.code()}"
        if (raw.isNullOrBlank()) return fallback
        return try {
            Gson().fromJson(raw, ErrorResponse::class.java)?.error ?: fallback
        } catch (e: Exception) {
            fallback
        }
    }
}
