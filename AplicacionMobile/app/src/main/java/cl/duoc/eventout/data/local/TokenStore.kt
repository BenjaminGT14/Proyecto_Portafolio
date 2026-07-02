package cl.duoc.eventout.data.local

import android.content.Context
import android.content.SharedPreferences
import cl.duoc.eventout.data.remote.dto.UsuarioDto

/**
 * Guarda el JWT y los datos basicos del usuario en SharedPreferences.
 * Es el equivalente Android al localStorage (key "eventout_token") del frontend web.
 *
 * Se inicializa una vez desde EventOutApp.onCreate() antes de usarse.
 */
object TokenStore {

    private const val PREFS = "eventout_prefs"
    private const val KEY_TOKEN = "token"
    private const val KEY_ID = "id_usuario"
    private const val KEY_EMAIL = "email"
    private const val KEY_NOMBRE = "nombre"
    private const val KEY_AVATAR = "avatar_url"
    private const val KEY_ROL = "rol"

    private lateinit var prefs: SharedPreferences

    fun init(context: Context) {
        prefs = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    }

    fun saveSession(token: String, usuario: UsuarioDto) {
        prefs.edit()
            .putString(KEY_TOKEN, token)
            .putString(KEY_ID, usuario.idUsuario)
            .putString(KEY_EMAIL, usuario.email)
            .putString(KEY_NOMBRE, usuario.nombre)
            .putString(KEY_AVATAR, usuario.avatarUrl)
            .putString(KEY_ROL, usuario.rol)
            .apply()
    }

    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    fun getUsuario(): UsuarioDto? {
        val id = prefs.getString(KEY_ID, null) ?: return null
        return UsuarioDto(
            idUsuario = id,
            email = prefs.getString(KEY_EMAIL, "") ?: "",
            nombre = prefs.getString(KEY_NOMBRE, "") ?: "",
            avatarUrl = prefs.getString(KEY_AVATAR, null),
            rol = prefs.getString(KEY_ROL, "user") ?: "user"
        )
    }

    fun isLoggedIn(): Boolean = getToken() != null

    fun clear() {
        prefs.edit().clear().apply()
    }
}
