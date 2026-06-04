import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/core/auth/AuthContext'
import { AppLayout } from '@/view/components/layout/AppLayout'
import { AdminLayout } from '@/view/components/layout/AdminLayout'
import { ProtectedRoute } from '@/view/components/layout/ProtectedRoute'

// Rutas eager (núcleo de la app)
import { HomePage } from '@/view/pages/Home'
import { LugaresPage } from '@/view/pages/Lugares'
import { LugarDetallePage } from '@/view/pages/LugarDetalle'
import { EventosPage } from '@/view/pages/Eventos'
import { EventoDetallePage } from '@/view/pages/EventoDetalle'
import { MapaPage } from '@/view/pages/Mapa'
import { FavoritosPage } from '@/view/pages/Favoritos'
import { PerfilPage } from '@/view/pages/Perfil'
import { NotFoundPage } from '@/view/pages/NotFound'

// Rutas lazy (auth + admin, menos frecuentes)
const LoginPage = lazy(() =>
  import('@/view/pages/auth/Login').then((m) => ({ default: m.LoginPage })),
)
const RegistroPage = lazy(() =>
  import('@/view/pages/auth/Registro').then((m) => ({ default: m.RegistroPage })),
)
const RecuperarPasswordPage = lazy(() =>
  import('@/view/pages/auth/RecuperarPassword').then((m) => ({ default: m.RecuperarPasswordPage })),
)
const NuevaPasswordPage = lazy(() =>
  import('@/view/pages/auth/NuevaPassword').then((m) => ({ default: m.NuevaPasswordPage })),
)
const AdminDashboardPage = lazy(() =>
  import('@/view/pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboardPage })),
)
const AdminLugaresPage = lazy(() =>
  import('@/view/pages/admin/AdminLugares').then((m) => ({ default: m.AdminLugaresPage })),
)
const AdminEventosPage = lazy(() =>
  import('@/view/pages/admin/AdminEventos').then((m) => ({ default: m.AdminEventosPage })),
)
const AdminResenasPage = lazy(() =>
  import('@/view/pages/admin/AdminResenas').then((m) => ({ default: m.AdminResenasPage })),
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
              <Route path="recuperar-password/nueva" element={<NuevaPasswordPage />} />
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
