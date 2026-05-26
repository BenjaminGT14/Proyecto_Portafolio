import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, Ticket } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { MapaLazy as Mapa } from '@/components/MapaLazy'
import { ResenasSection } from '@/components/ResenasSection'
import { FavoritoCTA } from '@/components/FavoritoCTA'
import { obtenerEvento } from '@/lib/api'
import { useAsyncData } from '@/hooks/useAsyncData'
import { formatPrecio, formatFecha, imgPlaceholder } from '@/lib/utils'

export function EventoDetallePage() {
  const { id } = useParams()
  const { data: evento, loading, error } = useAsyncData(() => obtenerEvento(id), [id])

  if (loading) return <DetalleSkeleton />
  if (error || !evento) return <NoEncontrado />

  const fallback = imgPlaceholder(evento.id_evento, 1600, 700)
  const lugar = evento.lugar
  const punto = lugar && Number.isFinite(lugar.latitud) && Number.isFinite(lugar.longitud)
    ? {
        id: evento.id_evento,
        nombre: evento.nombre,
        latitud: lugar.latitud,
        longitud: lugar.longitud,
        comuna: lugar.comuna,
        tipo: 'evento',
      }
    : null

  return (
    <div className="space-y-8">
      <Link
        to="/eventos"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-secondary"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a eventos
      </Link>

      <header className="space-y-4">
        <div className="aspect-[21/9] w-full overflow-hidden rounded-2xl bg-slate-100">
          <img
            src={evento.imagen_url || fallback}
            alt={evento.nombre}
            className="h-full w-full object-cover"
            onError={(e) => {
              if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={evento.es_gratuito ? 'success' : 'brand'}>
            <Ticket className="h-3.5 w-3.5" />
            {formatPrecio(evento.precio, evento.es_gratuito)}
          </Badge>
        </div>

        <h1 className="text-3xl font-bold text-slate-900">{evento.nombre}</h1>
        <p className="text-base text-slate-600">{evento.descripcion}</p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Ubicación</h2>
          {punto ? (
            <Mapa
              puntos={[punto]}
              centro={{ lat: punto.latitud, lng: punto.longitud }}
              zoom={15}
              altura="h-80"
            />
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
              Este evento todavía no tiene ubicación asignada.
            </div>
          )}
        </div>

        <aside className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Información</h2>
          <DetalleItem icon={Calendar} label="Inicio">
            {formatFecha(evento.fecha_inicio)}
          </DetalleItem>
          {evento.fecha_fin && (
            <DetalleItem icon={Calendar} label="Término">
              {formatFecha(evento.fecha_fin)}
            </DetalleItem>
          )}
          {lugar && (
            <DetalleItem icon={MapPin} label="Lugar">
              <Link to={`/lugares/${lugar.id_lugar}`} className="text-secondary hover:underline">
                {lugar.nombre}
              </Link>
              <span className="block text-xs text-slate-500">{lugar.comuna}</span>
            </DetalleItem>
          )}

          <div className="pt-2">
            <FavoritoCTA idEvento={evento.id_evento} />
          </div>
        </aside>
      </section>

      <ResenasSection idEvento={evento.id_evento} />
    </div>
  )
}

function DetalleItem(props) {
  const Icon = props.icon
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
      <div className="text-sm text-slate-700">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{props.label}</p>
        <div className="mt-0.5">{props.children}</div>
      </div>
    </div>
  )
}

function DetalleSkeleton() {
  return (
    <div className="space-y-6">
      <div className="aspect-[21/9] w-full animate-pulse rounded-2xl bg-slate-200" />
      <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200" />
      <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
      <div className="h-80 w-full animate-pulse rounded-xl bg-slate-200" />
    </div>
  )
}

function NoEncontrado() {
  return (
    <div className="mx-auto w-full max-w-xl rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <h1 className="text-xl font-bold text-slate-900">Evento no encontrado</h1>
      <p className="mt-2 text-sm text-slate-600">
        El evento que buscas no existe o ya terminó.
      </p>
      <Link
        to="/eventos"
        className="mt-6 inline-block text-sm font-medium text-secondary hover:underline"
      >
        Volver al listado
      </Link>
    </div>
  )
}
