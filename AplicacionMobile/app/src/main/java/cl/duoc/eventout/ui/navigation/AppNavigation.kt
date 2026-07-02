package cl.duoc.eventout.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import cl.duoc.eventout.data.local.TokenStore
import cl.duoc.eventout.ui.auth.AuthViewModel
import cl.duoc.eventout.ui.auth.LoginScreen
import cl.duoc.eventout.ui.auth.RegisterScreen
import cl.duoc.eventout.ui.web.WebScreen

object Routes {
    const val LOGIN = "login"
    const val REGISTER = "register"
    const val HOME = "home"
}

@Composable
fun AppNavigation(modifier: Modifier = Modifier) {
    val navController = rememberNavController()
    // ViewModel compartido por Login/Registro (scope de la Activity).
    val authViewModel: AuthViewModel = viewModel()

    // Si ya hay sesion guardada, entrar directo a Home.
    val startDestination = if (TokenStore.isLoggedIn()) Routes.HOME else Routes.LOGIN

    NavHost(
        navController = navController,
        startDestination = startDestination,
        modifier = modifier
    ) {

        composable(Routes.LOGIN) {
            LoginScreen(
                viewModel = authViewModel,
                onAuthenticated = {
                    navController.navigate(Routes.HOME) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                },
                onNavigateToRegister = { navController.navigate(Routes.REGISTER) }
            )
        }

        composable(Routes.REGISTER) {
            RegisterScreen(
                viewModel = authViewModel,
                onAuthenticated = {
                    navController.navigate(Routes.HOME) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                },
                onNavigateToLogin = {
                    if (!navController.popBackStack(Routes.LOGIN, inclusive = false)) {
                        navController.navigate(Routes.LOGIN)
                    }
                }
            )
        }

        composable(Routes.HOME) {
            // Muestra el frontend web (React en EC2) con la sesion del login nativo inyectada.
            WebScreen(
                onSessionClosed = {
                    // El usuario cerro sesion dentro del web: limpiar la sesion nativa tambien.
                    authViewModel.logout()
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(Routes.HOME) { inclusive = true }
                    }
                }
            )
        }
    }
}
