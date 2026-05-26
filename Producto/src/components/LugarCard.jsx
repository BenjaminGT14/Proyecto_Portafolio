import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { BotonFavorito } from './BotonFavorito'
import { cn, imgPlaceholder } from '@/lib/utils'

export function LugarCard({ lugar }) {
  const categoria = lugar.categoria?.nombre
  const fallback = imgPlaceholder(lugar.id_lugar, 800, 500)
  return (
    <Link
      to={`/lugares/${lugar.id_lugar}`}
      className="group block overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={lugar.imagen_url || fallback}
          alt={lugar.nombre}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback
          }}
        />
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {categoria && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                {categoria}
              </span>
            )}
            <span
              className={cn(
                'rounded px-2 py-0.5 text-[11px] font-semibold',
                lugar.es_gratuito
                  ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                  : 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
              )}
            >
              {lugar.es_gratuito ? 'Gratis' : 'Pagado'}
            </span>
          </div>
          <BotonFavorito idLugar={lugar.id_lugar} />
        </div>
        <h3 className="line-clamp-1 text-base font-semibold text-on-surface">{lugar.nombre}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">{lugar.descripcion}</p>
        <div className="mt-3 space-y-1 text-xs text-outline">
          <div className="flex items-center gap-1.5">
            <Icon name="location_on" size="sm" />
            <span>
              {lugar.direccion}, {lugar.comuna}
            </span>
          </div>
          {lugar.horario && (
            <div className="flex items-center gap-1.5">
              <Icon name="schedule" size="sm" />
              <span>{lugar.horario}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
