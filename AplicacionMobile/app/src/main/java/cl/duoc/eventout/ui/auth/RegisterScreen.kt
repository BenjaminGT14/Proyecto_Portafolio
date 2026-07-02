package cl.duoc.eventout.ui.auth

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
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
import cl.duoc.eventout.ui.theme.Slate200
import cl.duoc.eventout.ui.theme.Slate600
import cl.duoc.eventout.ui.theme.Slate900

@Composable
fun RegisterScreen(
    viewModel: AuthViewModel,
    onAuthenticated: () -> Unit,
    onNavigateToLogin: () -> Unit,
    modifier: Modifier = Modifier
) {
    val state = viewModel.uiState

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

        Surface(
            color = CardWhite,
            shape = RoundedCornerShape(12.dp),
            border = BorderStroke(1.dp, Slate200),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(24.dp)) {
                Text(
                    text = "Crear cuenta",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = Slate900
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = "Únete a la comunidad de EventOut",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Slate600
                )
                Spacer(Modifier.height(24.dp))

                FieldLabel("Nombre")
                Spacer(Modifier.height(6.dp))
                OutlinedTextField(
                    value = state.nombre,
                    onValueChange = viewModel::onNombreChange,
                    placeholder = { Text("Cómo quieres que te veamos", color = Slate600) },
                    singleLine = true,
                    enabled = !state.isLoading,
                    colors = eventOutFieldColors(),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(Modifier.height(16.dp))

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
                Spacer(Modifier.height(16.dp))

                FieldLabel("Confirmar contraseña")
                Spacer(Modifier.height(6.dp))
                OutlinedTextField(
                    value = state.confirmPassword,
                    onValueChange = viewModel::onConfirmPasswordChange,
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
                Button(
                    onClick = viewModel::register,
                    enabled = !state.isLoading,
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                ) {
                    Text(
                        text = if (state.isLoading) "Creando cuenta…" else "Crear cuenta",
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }

        Spacer(Modifier.height(16.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = "¿Ya tienes cuenta?",
                style = MaterialTheme.typography.bodyMedium,
                color = Slate600
            )
            TextButton(
                onClick = {
                    viewModel.clearForm()
                    onNavigateToLogin()
                },
                enabled = !state.isLoading
            ) {
                Text(
                    text = "Ingresar",
                    color = BrandCoral,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}
