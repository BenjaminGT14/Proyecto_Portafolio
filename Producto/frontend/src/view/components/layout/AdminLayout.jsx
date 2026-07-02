import { NavLink, Outlet } from 'react-router-dom'
import { Icon } from '@/view/components/ui/Icon'
import { ConfirmDialog } from '@/view/components/ui/ConfirmDialog'
import { useAuth } from '@/core/auth/useAuth'
import { useLogout } from '@/core/auth/useLogout'
import { cn } from '@/core/utils'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/admin/lugares', label: 'Lugares', icon: 'place' },
  { to: '/admin/eventos', label: 'Eventos', icon: 'event' },
  { to: '/admin/resenas', label: 'Reseñas', icon: 'rate_review' },
]

// Ítems de la barra móvil (píldoras con scroll horizontal, mismo patrón del Header).
const mobileNavCls = ({ isActive }) =>
  cn(
    'flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-secondary/10 text-secondary'
      : 'text-on-surface-variant hover:text-on-surface',
  )

export function AdminLayout() {
  const { profile } = useAuth()
  const logout = useLogout('/')

  return (
    <div className="flex min-h-screen bg-surface-container-low">
      {/* Sidebar: solo desktop (lg+). En móvil se reemplaza por la barra superior. */}
      <aside className="hidden w-60 flex-col bg-white shadow-sm lg:flex">
        <div className="flex items-center gap-2 border-b border-outline-variant px-5 py-4">
          <Icon name="admin_panel_settings" size="md" className="text-secondary" />
          <span className="text-sm font-bold text-on-surface">Panel Admin</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary/10 text-secondary'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                )
              }
            >
              <Icon name={item.icon} size="sm" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-outline-variant p-4">
          <p className="mb-2 truncate text-xs text-outline">{profile?.nombre ?? 'Admin'}</p>
          <button
            type="button"
            onClick={logout.pedirConfirmacion}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-error"
          >
            <Icon name="logout" size="sm" />
            Salir
          </button>
        </div>
      </aside>

      <ConfirmDialog
        open={logout.confirming}
        title="Cerrar sesión"
        message="¿Seguro que quieres salir del panel de administración? Tendrás que volver a ingresar."
        confirmLabel="Cerrar sesión"
        cancelLabel="Cancelar"
        loading={logout.loading}
        onConfirm={logout.confirmar}
        onCancel={logout.cancelar}
      />

      {/* Main. min-w-0 permite que las tablas anchas hagan scroll sin romper el layout. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-outline-variant bg-white px-4 py-4 sm:px-8">
          <NavLink to="/" className="flex items-center gap-1.5 text-sm text-outline hover:text-secondary">
            <Icon name="arrow_back" size="sm" />
            Volver al sitio
          </NavLink>
          <span className="hidden text-xs text-outline sm:inline">EventOut Admin</span>
          {/* Salir visible en móvil, donde no existe el sidebar. */}
          <button
            type="button"
            onClick={logout.pedirConfirmacion}
            className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-error lg:hidden"
          >
            <Icon name="logout" size="sm" />
            Salir
          </button>
        </header>

        {/* Nav móvil del panel: scroll horizontal con degradado, como el Header del sitio. */}
        <div className="relative border-b border-outline-variant bg-white lg:hidden">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 py-2 pr-10">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={mobileNavCls}>
                <Icon name={item.icon} size="sm" />
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" />
        </div>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
