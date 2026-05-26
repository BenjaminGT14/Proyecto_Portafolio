import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/admin/lugares', label: 'Lugares', icon: 'place' },
  { to: '/admin/eventos', label: 'Eventos', icon: 'event' },
  { to: '/admin/resenas', label: 'Reseñas', icon: 'rate_review' },
]

export function AdminLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-surface-container-low">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col bg-white shadow-sm">
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
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-error"
          >
            <Icon name="logout" size="sm" />
            Salir
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-outline-variant bg-white px-8 py-4">
          <NavLink to="/" className="flex items-center gap-1.5 text-sm text-outline hover:text-secondary">
            <Icon name="arrow_back" size="sm" />
            Volver al sitio
          </NavLink>
          <span className="text-xs text-outline">Entreteca Admin</span>
        </header>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
