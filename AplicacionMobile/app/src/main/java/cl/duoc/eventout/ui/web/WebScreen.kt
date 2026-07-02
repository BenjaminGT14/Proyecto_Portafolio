package cl.duoc.eventout.ui.web

import android.annotation.SuppressLint
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import cl.duoc.eventout.BuildConfig
import cl.duoc.eventout.data.local.TokenStore
import cl.duoc.eventout.ui.theme.BrandCoral
import cl.duoc.eventout.ui.theme.Slate600
import cl.duoc.eventout.ui.theme.Surface as SurfaceColor

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebScreen(
    onSessionClosed: () -> Unit,
    modifier: Modifier = Modifier
) {
    var webViewRef by remember { mutableStateOf<WebView?>(null) }
    var canGoBack by remember { mutableStateOf(false) }
    // La pantalla de carga se oculta recien cuando el web quedo listo CON la sesion.
    var isReady by remember { mutableStateOf(false) }

    // El boton "atras" del sistema navega dentro del WebView en vez de cerrar la app.
    BackHandler(enabled = canGoBack) {
        webViewRef?.goBack()
    }

    Box(modifier = modifier.fillMaxSize()) {
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { context ->
                WebView(context).apply {
                    settings.javaScriptEnabled = true
                    // Necesario para que funcione localStorage dentro del WebView.
                    settings.domStorageEnabled = true

                    webViewClient = object : WebViewClient() {
                        private var sessionInjected = false
                        private var sessionClosedNotified = false

                        override fun onPageFinished(view: WebView, url: String?) {
                            super.onPageFinished(view, url)
                            canGoBack = view.canGoBack()
                            if (!sessionInjected) {
                                sessionInjected = true
                                val token = TokenStore.getToken()
                                if (token != null) {
                                    // Inyecta el JWT como lo guardaria el propio frontend y
                                    // recarga para que React arranque con la sesion activa.
                                    view.evaluateJavascript(
                                        "localStorage.setItem('eventout_token', '$token');"
                                    ) {
                                        view.loadUrl(BuildConfig.WEB_URL)
                                    }
                                } else {
                                    isReady = true
                                }
                            } else {
                                // Segunda carga (ya con sesion): ocultar la pantalla de carga.
                                isReady = true
                            }
                        }

                        override fun onReceivedError(
                            view: WebView,
                            request: WebResourceRequest,
                            error: WebResourceError
                        ) {
                            super.onReceivedError(view, request, error)
                            // Si falla la carga principal, mostrar el WebView (con su error)
                            // en vez de dejar el spinner infinito.
                            if (request.isForMainFrame) isReady = true
                        }

                        override fun doUpdateVisitedHistory(view: WebView, url: String?, isReload: Boolean) {
                            super.doUpdateVisitedHistory(view, url, isReload)
                            canGoBack = view.canGoBack()
                            // Tras cada navegacion del SPA, revisa si el web borro el token
                            // (o sea, el usuario cerro sesion dentro del frontend).
                            if (sessionInjected && !sessionClosedNotified) {
                                view.evaluateJavascript("localStorage.getItem('eventout_token')") { value ->
                                    if (value == "null" && !sessionClosedNotified) {
                                        sessionClosedNotified = true
                                        onSessionClosed()
                                    }
                                }
                            }
                        }
                    }

                    loadUrl(BuildConfig.WEB_URL)
                    webViewRef = this
                }
            }
        )

        // Pantalla de carga con la marca, tapa el WebView hasta que la sesion este lista.
        if (!isReady) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(SurfaceColor),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "EventOut",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = BrandCoral
                )
                Spacer(Modifier.height(24.dp))
                CircularProgressIndicator(
                    color = BrandCoral,
                    modifier = Modifier.size(36.dp)
                )
                Spacer(Modifier.height(16.dp))
                Text(
                    text = "Cargando tu sesión…",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Slate600
                )
            }
        }
    }
}
