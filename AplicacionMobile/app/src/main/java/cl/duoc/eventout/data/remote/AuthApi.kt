package cl.duoc.eventout.data.remote

import cl.duoc.eventout.data.remote.dto.AuthResponse
import cl.duoc.eventout.data.remote.dto.LoginRequest
import cl.duoc.eventout.data.remote.dto.RegisterRequest
import cl.duoc.eventout.data.remote.dto.UsuarioDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

/**
 * Endpoints de autenticacion del backend EventOut.
 * Se devuelve Response<> para poder leer el cuerpo de error {error} cuando el codigo no es 2xx.
 */
interface AuthApi {

    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): Response<AuthResponse>

    @POST("auth/register")
    suspend fun register(@Body body: RegisterRequest): Response<AuthResponse>

    @GET("auth/me")
    suspend fun me(): Response<UsuarioDto>
}
