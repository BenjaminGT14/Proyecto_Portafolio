package cl.duoc.eventout

import android.app.Application
import cl.duoc.eventout.data.local.TokenStore

/**
 * Application propia para inicializar el almacenamiento de sesion (TokenStore)
 * una sola vez, antes de que cualquier pantalla o interceptor lo use.
 */
class EventOutApp : Application() {
    override fun onCreate() {
        super.onCreate()
        TokenStore.init(this)
    }
}
