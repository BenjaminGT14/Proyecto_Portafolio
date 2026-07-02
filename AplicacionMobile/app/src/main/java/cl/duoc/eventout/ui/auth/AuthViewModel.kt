package cl.duoc.eventout.ui.auth

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cl.duoc.eventout.data.local.TokenStore
import cl.duoc.eventout.data.repository.AuthRepository
import kotlinx.coroutines.launch

/** Estado de las pantallas de Login/Registro. */
data class AuthUiState(
    val nombre: String = "",
    val email: String = "",
    val password: String = "",
    val confirmPassword: String = "",
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val isAuthenticated: Boolean = false
)

class AuthViewModel(
    private val repo: AuthRepository = AuthRepository()
) : ViewModel() {

    var uiState by mutableStateOf(AuthUiState())
        private set

    fun onNombreChange(value: String) {
        uiState = uiState.copy(nombre = value, errorMessage = null)
    }

    fun onEmailChange(value: String) {
        uiState = uiState.copy(email = value, errorMessage = null)
    }

    fun onPasswordChange(value: String) {
        uiState = uiState.copy(password = value, errorMessage = null)
    }

    fun onConfirmPasswordChange(value: String) {
        uiState = uiState.copy(confirmPassword = value, errorMessage = null)
    }

    /** Limpia campos/errores al cambiar entre Login y Registro. */
    fun clearForm() {
        uiState = AuthUiState(isAuthenticated = uiState.isAuthenticated)
    }

    fun login() {
        val email = uiState.email.trim()
        val password = uiState.password
        if (email.isBlank() || password.isBlank()) {
            uiState = uiState.copy(errorMessage = "Ingresa tu email y contraseña.")
            return
        }
        viewModelScope.launch {
            uiState = uiState.copy(isLoading = true, errorMessage = null)
            val result = repo.login(email, password)
            uiState = result.fold(
                onSuccess = { uiState.copy(isLoading = false, isAuthenticated = true) },
                onFailure = { uiState.copy(isLoading = false, errorMessage = it.message) }
            )
        }
    }

    fun register() {
        val nombre = uiState.nombre.trim()
        val email = uiState.email.trim()
        val password = uiState.password
        val confirm = uiState.confirmPassword

        val validationError = when {
            nombre.isBlank() -> "Ingresa tu nombre."
            email.isBlank() -> "Ingresa tu email."
            password.length < 8 -> "La contraseña debe tener al menos 8 caracteres."
            password != confirm -> "Las contraseñas no coinciden."
            else -> null
        }
        if (validationError != null) {
            uiState = uiState.copy(errorMessage = validationError)
            return
        }

        viewModelScope.launch {
            uiState = uiState.copy(isLoading = true, errorMessage = null)
            val result = repo.register(nombre, email, password)
            uiState = result.fold(
                onSuccess = { uiState.copy(isLoading = false, isAuthenticated = true) },
                onFailure = { uiState.copy(isLoading = false, errorMessage = it.message) }
            )
        }
    }

    fun logout() {
        TokenStore.clear()
        uiState = AuthUiState()
    }
}
