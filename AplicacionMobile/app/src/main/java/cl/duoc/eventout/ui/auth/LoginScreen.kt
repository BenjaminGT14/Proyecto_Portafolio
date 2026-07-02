package cl.duoc.eventout.ui.auth

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Place
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import cl.duoc.eventout.ui.theme.BrandCoral
import cl.duoc.eventout.ui.theme.CardWhite
import cl.duoc.eventout.ui.theme.OutlineVariant
import cl.duoc.eventout.ui.theme.Red200
import cl.duoc.eventout.ui.theme.Red50
import cl.duoc.eventout.ui.theme.Red700
import cl.duoc.eventout.ui.theme.Slate200
import cl.duoc.eventout.ui.theme.Slate600
import cl.duoc.eventout.ui.theme.Slate900

/** Colores de los campos de texto, espejo del Input del frontend web. */
@Composable
fun eventOutFieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = BrandCoral,
    unfocusedBorderColor = OutlineVariant,
    cursorColor = BrandCoral,
    focusedContainerColor = CardWhite,
    unfocusedContainerColor = CardWhite,
)

/** Etiqueta sobre el campo, como el <Label> del web. */
@Composable
fun FieldLabel(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.labelLarge,
        fontWeight = FontWeight.Medium,
        color = Slate900,
        modifier = Modifier.fillMaxWidth()
    )
}

/** Banner de error rojo, espejo del <Banner> del web (red-50 / red-200 / red-700). */
@Composable
fun ErrorBanner(message: String) {
    Text(
        text = message,
        style = MaterialTheme.typography.bodySmall,
        color = Red700,
        modifier = Modifier
            .fillMaxWidth()
            .background(Red50, RoundedCornerShape(8.dp))
            .border(1.dp, Red200, RoundedCornerShape(8.dp))
            .padding(horizontal = 12.dp, vertical = 8.dp)
    )
}

/** Logo "EventOut" en coral, como el encabezado del AuthLayout web. */
@Composable
fun BrandHeader() {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(
            imageVector = Icons.Filled.Place,
            contentDescription = null,
            tint = BrandCoral,
            modifier = Modifier.size(28.dp)
        )
        Spacer(Modifier.width(8.dp))
        Text(
            text = "EventOut",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = BrandCoral
        )
    }
}

@Composable
fun LoginScreen(
    viewModel: AuthViewModel,
    onAuthenticated: () -> Unit,
    onNavigateToRegister: () -> Unit,
    modifier: Modifier = Modifier
) {
    val state = viewModel.uiState

    // Cuando el login resulta OK, navegar al frontend web.
    LaunchedEffect(state.isAuthenticated) {
        if (state.isAuthenticated) onAuthenticated()
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        BrandHeader()
        Spacer(Modifier.height(24.dp))

        // Tarjeta blanca como la del AuthLayout del web.
        Surface(
            color = CardWhite,
            shape = RoundedCornerShape(12.dp),
            border = BorderStroke(1.dp, Slate200),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(24.dp)) {
                Text(
                    text = "Ingresar",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = "Bienvenido de vuelta a EventOut",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Slate600
                )
                Spacer(Modifier.height(24.dp))

                FieldLabel("Correo")
                Spacer(Modifier.height(6.dp))
                OutlinedTextField(
                    value = state.email,
                    onValueChange = viewModel::onEmailChange,
                    placeholder = { Text("tu@correo.cl", color = Slate600) },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    enabled = !state.isLoading,
                    colors = eventOutFieldColors(),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(Modifier.height(16.dp))

                FieldLabel("Contraseña")
                Spacer(Modifier.height(6.dp))
                OutlinedTextField(
                    value = state.password,
                    onValueChange = viewModel::onPasswordChange,
                    singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    enabled = !state.isLoading,
                    colors = eventOutFieldColors(),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                )

                if (state.errorMessage != null) {
                    Spacer(Modifier.height(16.dp))
                    ErrorBanner(state.errorMessage)
                }

                Spacer(Modifier.height(24.dp))
                // Boton negro de ancho completo, como el <Button> primario del web.
                Button(
                    onClick = viewModel::login,
                    enabled = !state.isLoading,
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                ) {
                    Text(
                        text = if (state.isLoading) "Ingresando…" else "Ingresar",
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }

        Spacer(Modifier.height(16.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = "¿No tienes cuenta?",
                style = MaterialTheme.typography.bodyMedium,
                color = Slate600
            )
            TextButton(
                onClick = {
                    viewModel.clearForm()
                    onNavigateToRegister()
                },
                enabled = !state.isLoading
            ) {
                Text(
                    text = "Crea una aquí",
                    color = BrandCoral,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}
