import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'

// Rutas eager (núcleo de la app)
import { HomePage } from '@/pages/Home'
import { LugaresPage } from '@/pages/Lugares'
import { LugarDetallePage } from '@/pages/LugarDetalle'
import { EventosPage } from '@/pages/Eventos'
import { EventoDetallePage } from '@/pages/EventoDetalle'
import { MapaPage } from '@/pages/Mapa'
import { FavoritosPage } from '@/pages/Favoritos'
import { PerfilPage, NotFoundPage } from '@/pages/Placeholder'

// Rutas lazy (auth + admin, menos frecuentes)
const LoginPage = lazy(() =>
  import('@/pages/auth/Login').then((m) => ({ default: m.LoginPage })),
)
const RegistroPage = lazy(() =>
  import('@/pages/auth/Registro').then((m) => ({ default: m.RegistroPage })),
)
const RecuperarPasswordPage = lazy(() =>
  import('@/pages/auth/RecuperarPassword').then((m) => ({ default: m.RecuperarPasswordPage })),
)
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboardPage })),
)
const AdminLugaresPage = lazy(() =>
  import('@/pages/admin/AdminLugares').then((m) => ({ default: m.AdminLugaresPage })),
)
const AdminEventosPage = lazy(() =>
  import('@/pages/admin/AdminEventos').then((m) => ({ default: m.AdminEventosPage })),
)
const AdminResenasPage = lazy(() =>
  import('@/pages/admin/AdminResenas').then((m) => ({ default: m.AdminResenasPage })),
)

function PageFallback() {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-outline">
      Cargando…
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* ---- Sitio público ---- */}
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="lugares" element={<LugaresPage />} />
              <Route path="lugares/:id" element={<LugarDetallePage />} />
              <Route path="eventos" element={<EventosPage />} />
              <Route path="eventos/:id" element={<EventoDetallePage />} />
              <Route path="mapa" element={<MapaPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="registro" element={<RegistroPage />} />
              <Route path="recuperar-password" element={<RecuperarPasswordPage />} />
              <Route
                path="favoritos"
                element={
                  <ProtectedRoute>
                    <FavoritosPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="perfil"
                element={
                  <ProtectedRoute>
                    <PerfilPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* ---- Panel de administración ---- */}
            <Route
              path="admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="lugares" element={<AdminLugaresPage />} />
              <Route path="eventos" element={<AdminEventosPage />} />
              <Route path="resenas" element={<AdminResenasPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
