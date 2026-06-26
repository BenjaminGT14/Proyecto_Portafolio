import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Icon } from '@/view/components/ui/Icon'
import { ConfirmDialog } from '@/view/components/ui/ConfirmDialog'
import { useAuth } from '@/core/auth/useAuth'
import { useLogout } from '@/core/auth/useLogout'
import { cn } from '@/core/utils'

const BASE_NAV = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/lugares', label: 'Explorar' },
  { to: '/mapa', label: 'Mapa' },
  { to: '/eventos', label: 'Eventos' },
]

const navCls = (isActive) =>
  cn(
    'pb-1 text-sm font-medium tracking-tight transition-all duration-200',
    isActive
      ? 'border-b-2 border-secondary text-secondary'
      : 'text-slate-600 hover:text-secondary',
  )

export function Header() {
  const { isAuthenticated, isAdmin, profile, isDemo } = useAuth()
  const navigate = useNavigate()
  const logout = useLogout('/')

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 xl:max-w-[1440px] xl:px-10">
        {/* Logo */}
        <Link to="/" className="text-xl font-extrabold tracking-tighter text-slate-900">
          EventOut
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {BASE_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => navCls(isActive)}>
              {item.label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <NavLink to="/favoritos" className={({ isActive }) => navCls(isActive)}>
              <span className="flex items-center gap-1">
                <Icon name="favorite" size="sm" />
                Favoritos
              </span>
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) =>
              cn(navCls(isActive), 'flex items-center gap-1')}>
              <Icon name="admin_panel_settings" size="sm" />
              Admin
            </NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/perfil" className={({ isActive }) => navCls(isActive)}>
              {profile?.nombre ?? 'Perfil'}
            </NavLink>
          )}
        </div>

        {/* Desktop actions */}
        <div className="flex items-center gap-3">
          {isDemo ? (
            <span className="hidden items-center gap-1.5 rounded-full bg-tertiary-fixed px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-on-tertiary-fixed-variant md:inline-flex">
              <Icon name="science" size="sm" />
              Modo demo
            </span>
          ) : isAuthenticated ? (
            <button type="button" onClick={logout.pedirConfirmacion}
              className="hidden items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 md:inline-flex">
              <Icon name="logout" size="sm" />
              Salir
            </button>
          ) : (
            <Link to="/login"
              className="hidden text-sm font-medium tracking-tight text-slate-600 hover:text-secondary md:inline">
              Login
            </Link>
          )}
          <button type="button"
            onClick={() => navigate(isAuthenticated ? '/lugares' : '/registro')}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold tracking-wide text-on-primary transition-transform duration-200 hover:scale-105 active:scale-95">
            Explorar ahora
          </button>
        </div>
      </div>

      {/* Mobile scroll nav */}
      <div className="no-scrollbar flex items-center gap-6 overflow-x-auto border-t border-slate-100 px-6 py-2 md:hidden">
        {BASE_NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}
            className={({ isActive }) =>
              cn('whitespace-nowrap pb-1 text-sm font-medium tracking-tight',
                isActive ? 'border-b-2 border-secondary text-secondary' : 'text-slate-600')}>
            {item.label}
          </NavLink>
        ))}
        {isAuthenticated && (
          <NavLink to="/favoritos"
            className={({ isActive }) =>
              cn('whitespace-nowrap pb-1 text-sm font-medium tracking-tight',
                isActive ? 'border-b-2 border-secondary text-secondary' : 'text-slate-600')}>
            Favoritos
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/admin"
            className={({ isActive }) =>
              cn('whitespace-nowrap pb-1 text-sm font-medium tracking-tight',
                isActive ? 'border-b-2 border-secondary text-secondary' : 'text-slate-600')}>
            Admin
          </NavLink>
        )}
      </div>

      <ConfirmDialog
        open={logout.confirming}
        title="Cerrar sesión"
        message="¿Seguro que quieres cerrar tu sesión? Tendrás que volver a ingresar para acceder a tus favoritos y propuestas."
        confirmLabel="Cerrar sesión"
        cancelLabel="Cancelar"
        loading={logout.loading}
        onConfirm={logout.confirmar}
        onCancel={logout.cancelar}
      />
    </nav>
  )
}
