import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Construction } from 'lucide-react'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/hooks/useAuth'
import { avatarUrl } from '@/lib/utils'

export function PerfilPage() {
  const { user, profile, isAdmin, isDemo, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const nombre = profile?.nombre ?? 'Usuario'
  const iniciales = nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'U'

  // Cadena de fallback para el avatar: profile.avatar_url → DiceBear → iniciales.
  const [imgFallido, setImgFallido] = useState(false)
  const dicebear = avatarUrl(nombre)
  const srcAvatar = !imgFallido ? (profile?.avatar_url || dicebear) : null

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* Cabecera del perfil */}
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-outline-variant bg-white p-6 text-center shadow-sm sm:flex-row sm:items-center sm:text-left sm:p-8">
        {srcAvatar ? (
          <img
            src={srcAvatar}
            alt={nombre}
            className="h-20 w-20 shrink-0 rounded-full bg-secondary object-cover"
            onError={() => setImgFallido(true)}
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-secondary text-2xl font-bold text-white">
            {iniciales}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-bold text-on-surface">{nombre}</p>
          <p className="truncate text-sm text-outline">{user?.email ?? 'demo@entreteca.cl'}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            {isAdmin && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary-fixed px-2.5 py-1 text-[11px] font-semibold text-on-secondary-fixed-variant">
                <Icon name="admin_panel_settings" size="sm" />
                Administrador
              </span>
            )}
            {isDemo && (
              <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-2.5 py-1 text-[11px] font-semibold text-on-tertiary-fixed-variant">
                <Icon name="science" size="sm" />
                Modo demo
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/favoritos"
          className="flex items-center gap-4 rounded-2xl border border-outline-variant bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-fixed">
            <Icon name="favorite" size="md" className="text-secondary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-on-surface">Mis favoritos</p>
            <p className="text-xs text-outline">Lugares y eventos guardados</p>
          </div>
          <Icon name="chevron_right" size="sm" className="shrink-0 text-outline" />
        </Link>

        {isAdmin && (
          <Link
            to="/admin"
            className="flex items-center gap-4 rounded-2xl border border-outline-variant bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-fixed">
              <Icon name="admin_panel_settings" size="md" className="text-secondary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-on-surface">Panel de administración</p>
              <p className="text-xs text-outline">Gestionar contenidos y reseñas</p>
            </div>
            <Icon name="chevron_right" size="sm" className="shrink-0 text-outline" />
          </Link>
        )}
      </div>

      {/* Cerrar sesión */}
      {!isDemo && (
        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-outline-variant bg-white px-4 py-3 text-sm font-semibold text-error shadow-sm hover:bg-error-container/20"
        >
          <Icon name="logout" size="sm" />
          Cerrar sesión
        </button>
      )}

      {isDemo && (
        <p className="text-center text-xs text-outline">
          Estás en modo demo. Para sesión real, conecta Supabase mediante variables de entorno.
        </p>
      )}
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className="mx-auto w-full max-w-xl py-16 text-center">
      <p className="text-sm font-medium text-secondary">404</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Página no encontrada</h1>
      <p className="mt-2 text-slate-600">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block text-sm font-medium text-secondary hover:underline"
      >
        Volver al inicio
      </Link>
    </div>
  )
}

// PlaceholderPage se mantiene en caso de que se necesite en el futuro
export function PlaceholderPage({ titulo, descripcion }) {
  return (
    <div className="mx-auto w-full max-w-xl rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <Construction className="mx-auto mb-3 h-10 w-10 text-slate-400" />
      <h1 className="text-xl font-bold text-slate-900">{titulo}</h1>
      <p className="mt-2 text-sm text-slate-600">{descripcion}</p>
      <Link to="/" className="mt-6 inline-block text-sm font-medium text-secondary hover:underline">
        Volver al inicio
      </Link>
    </div>
  )
}
