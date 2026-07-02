package cl.duoc.eventout.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

/**
 * Tema EventOut: espejo del frontend web (Producto/frontend), que es solo claro
 * (color-scheme: light). Se desactivan el modo oscuro y los colores dinamicos de
 * Android 12+ para que la marca se vea igual que en el sitio.
 */
private val EventOutColorScheme = lightColorScheme(
    primary = BrandBlack,
    onPrimary = OnBrandBlack,
    secondary = BrandCoral,
    onSecondary = OnBrandCoral,
    secondaryContainer = CoralContainer,
    onSecondaryContainer = OnCoralContainer,
    tertiary = BrandCoral,
    onTertiary = OnBrandCoral,
    background = Surface,
    onBackground = OnSurface,
    surface = Surface,
    onSurface = OnSurface,
    surfaceVariant = CardWhite,
    onSurfaceVariant = Slate600,
    error = ErrorRed,
    errorContainer = ErrorContainer,
    onErrorContainer = OnErrorContainer,
    outline = Outline,
    outlineVariant = OutlineVariant,
)

@Composable
fun EventOutTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = EventOutColorScheme,
        typography = Typography,
        content = content
    )
}
