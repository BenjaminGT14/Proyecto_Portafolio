import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { BotonFavorito } from './BotonFavorito'
import { formatPrecio, formatFecha, cn, imgPlaceholder } from '@/lib/utils'

export function EventoCard({ evento }) {
  const fallback = imgPlaceholder(evento.id_evento, 800, 500)
  return (
    <Link
      to={`/eventos/${evento.id_evento}`}
      className="group block overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={evento.imagen_url || fallback}
          alt={evento.nombre}
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-error">
              Evento
            </span>
            <span
              className={cn(
                'rounded px-2 py-0.5 text-[11px] font-semibold',
                evento.es_gratuito
                  ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                  : 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
              )}
            >
              {formatPrecio(evento.precio, evento.es_gratuito)}
            </span>
          </div>
          <BotonFavorito idEvento={evento.id_evento} />
        </div>
        <h3 className="line-clamp-1 text-base font-semibold text-on-surface">{evento.nombre}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">{evento.descripcion}</p>
        <div className="mt-3 space-y-1 text-xs text-outline">
          <div className="flex items-center gap-1.5">
            <Icon name="event" size="sm" />
            <span>{formatFecha(evento.fecha_inicio)}</span>
          </div>
          {evento.lugar && (
            <div className="flex items-center gap-1.5">
              <Icon name="location_on" size="sm" />
              <span>
                {evento.lugar.nombre}, {evento.lugar.comuna}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
