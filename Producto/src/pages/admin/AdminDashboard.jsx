import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { listarLugares, listarEventos, listarResenasAdmin } from '@/lib/api'
import { useAsyncData } from '@/hooks/useAsyncData'

function StatCard({ icon, label, value, to, color = 'text-secondary' }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 rounded-2xl border border-outline-variant bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-secondary/10">
        <Icon name={icon} size="md" className={color} />
      </div>
      <div>
        <p className="text-2xl font-bold text-on-surface">{value ?? '—'}</p>
        <p className="text-sm text-on-surface-variant">{label}</p>
      </div>
      <Icon name="chevron_right" size="sm" className="ml-auto text-outline" />
    </Link>
  )
}

export function AdminDashboardPage() {
  const { data: lugares } = useAsyncData(() => listarLugares(), [])
  const { data: eventos } = useAsyncData(() => listarEventos(), [])
  const { data: resenas } = useAsyncData(() => listarResenasAdmin(), [])

  const lugaresArr = lugares ?? []
  const eventosArr = eventos ?? []
  const resenasArr = resenas ?? []

  const pendientes = resenasArr.filter((r) => r.estado !== 'visible').length
  const visibles = resenasArr.filter((r) => r.estado === 'visible').length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Dashboard</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Resumen general de contenidos.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="place" label="Lugares" value={lugaresArr.length} to="/admin/lugares" />
        <StatCard icon="event" label="Eventos" value={eventosArr.length} to="/admin/eventos" />
        <StatCard icon="rate_review" label="Reseñas visibles" value={visibles} to="/admin/resenas" />
        <StatCard
          icon="visibility_off"
          label="Reseñas ocultas/eliminadas"
          value={pendientes}
          to="/admin/resenas"
          color="text-error"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Últimos lugares */}
        <section className="rounded-2xl border border-outline-variant bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-on-surface">Últimos lugares</h2>
            <Link to="/admin/lugares" className="text-xs text-secondary hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="space-y-2">
            {lugaresArr.slice(0, 5).map((l) => (
              <div
                key={l.id_lugar}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-surface-container-low"
              >
                <div>
                  <p className="text-sm font-medium text-on-surface">{l.nombre}</p>
                  <p className="text-xs text-outline">{l.comuna} · {l.categoria?.nombre}</p>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                    l.es_gratuito
                      ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                      : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                  }`}
                >
                  {l.es_gratuito ? 'Gratis' : 'Pagado'}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Últimas reseñas */}
        <section className="rounded-2xl border border-outline-variant bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-on-surface">Últimas reseñas</h2>
            <Link to="/admin/resenas" className="text-xs text-secondary hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="space-y-2">
            {resenasArr.slice(0, 5).map((r) => (
              <div
                key={r.id_resena}
                className="flex items-start justify-between gap-2 rounded-lg px-3 py-2 hover:bg-surface-container-low"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-on-surface">{r.titulo}</p>
                  <p className="text-xs text-outline">
                    {r.autor?.nombre ?? 'Usuario'} ·{' '}
                    {r.lugar?.nombre ?? r.evento?.nombre ?? '—'}
                  </p>
                </div>
                <EstadoBadge estado={r.estado} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export function EstadoBadge({ estado }) {
  const cfg = {
    visible: 'bg-secondary-fixed text-on-secondary-fixed-variant',
    oculta: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    eliminada: 'bg-error-container text-error',
  }
  return (
    <span className={`flex-shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold ${cfg[estado] ?? cfg.oculta}`}>
      {estado}
    </span>
  )
}
