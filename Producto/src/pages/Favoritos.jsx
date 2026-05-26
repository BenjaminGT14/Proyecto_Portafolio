import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { LugarCard } from '@/components/LugarCard'
import { EventoCard } from '@/components/EventoCard'
import { listarFavoritos } from '@/lib/api'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useAuth } from '@/hooks/useAuth'

export function FavoritosPage() {
  const { user } = useAuth()
  const { data, loading } = useAsyncData(
    () => listarFavoritos({ idUsuario: user?.id }),
    [user?.id],
  )

  const lugares = data?.lugares ?? []
  const eventos = data?.eventos ?? []
  const total = lugares.length + eventos.length

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Mis favoritos</h1>
        <p className="text-sm text-on-surface-variant">
          Los lugares y eventos que has guardado para volver a ellos.
        </p>
      </header>

      {loading ? (
        <SkeletonGrid />
      ) : total === 0 ? (
        <EmptyState />
      ) : (
        <>
          {lugares.length > 0 && (
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                <Icon name="place" />
                Lugares
                <span className="text-base font-normal text-outline">({lugares.length})</span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lugares.map((l) => (
                  <LugarCard key={l.id_lugar} lugar={l} />
                ))}
              </div>
            </section>
          )}

          {eventos.length > 0 && (
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                <Icon name="event" />
                Eventos
                <span className="text-base font-normal text-outline">({eventos.length})</span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {eventos.map((e) => (
                  <EventoCard key={e.id_evento} evento={e} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-outline-variant bg-white">
          <div className="aspect-[16/10] animate-pulse bg-surface-container-high" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-1/3 animate-pulse rounded bg-surface-container-high" />
            <div className="h-5 w-2/3 animate-pulse rounded bg-surface-container-high" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-dashed border-outline-variant bg-white p-10 text-center">
      <Icon name="favorite" size="lg" className="text-outline" />
      <p className="mt-3 text-sm text-on-surface-variant">
        Todavía no has guardado nada. Explora lugares y eventos, y toca el corazón para volver más tarde.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          to="/lugares"
          className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
        >
          Ver lugares
        </Link>
        <Link
          to="/eventos"
          className="rounded-lg border border-outline-variant bg-white px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container-low"
        >
          Ver eventos
        </Link>
      </div>
    </div>
  )
}
