import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { MapaLazy as Mapa } from '@/components/MapaLazy'
import { ResenasSection } from '@/components/ResenasSection'
import { FavoritoCTA } from '@/components/FavoritoCTA'
import { obtenerLugar } from '@/lib/api'
import { useAsyncData } from '@/hooks/useAsyncData'
import { imgPlaceholder } from '@/lib/utils'

export function LugarDetallePage() {
  const { id } = useParams()
  const { data: lugar, loading, error } = useAsyncData(() => obtenerLugar(id), [id])

  if (loading) return <DetalleSkeleton />
  if (error || !lugar) return <NoEncontrado />

  const fallback = imgPlaceholder(lugar.id_lugar, 1600, 700)
  const punto = {
    id: lugar.id_lugar,
    nombre: lugar.nombre,
    latitud: lugar.latitud,
    longitud: lugar.longitud,
    comuna: lugar.comuna,
    tipo: 'lugar',
  }

  return (
    <div className="space-y-8">
      <Link
        to="/lugares"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-secondary"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a lugares
      </Link>

      <header className="space-y-4">
        <div className="aspect-[21/9] w-full overflow-hidden rounded-2xl bg-slate-100">
          <img
            src={lugar.imagen_url || fallback}
            alt={lugar.nombre}
            className="h-full w-full object-cover"
            onError={(e) => {
              if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {lugar.categoria?.nombre && <Badge variant="brand">{lugar.categoria.nombre}</Badge>}
          <Badge variant={lugar.es_gratuito ? 'success' : 'default'}>
            {lugar.es_gratuito ? 'Entrada gratuita' : 'Entrada pagada'}
          </Badge>
        </div>

        <h1 className="text-3xl font-bold text-slate-900">{lugar.nombre}</h1>
        <p className="text-base text-slate-600">{lugar.descripcion}</p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Ubicación</h2>
          <Mapa puntos={[punto]} centro={{ lat: lugar.latitud, lng: lugar.longitud }} zoom={15} altura="h-80" />
        </div>

        <aside className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Información</h2>
          <DetalleItem icon={MapPin} label="Dirección">
            <span>{lugar.direccion}</span>
            <span className="block text-xs text-slate-500">{lugar.comuna}</span>
          </DetalleItem>
          {lugar.horario && (
            <DetalleItem icon={Clock} label="Horario">
              {lugar.horario}
            </DetalleItem>
          )}

          <div className="pt-2">
            <FavoritoCTA idLugar={lugar.id_lugar} />
          </div>
        </aside>
      </section>

      <ResenasSection idLugar={lugar.id_lugar} />
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
      <h1 className="text-xl font-bold text-slate-900">Lugar no encontrado</h1>
      <p className="mt-2 text-sm text-slate-600">
        El lugar que buscas no existe o fue eliminado.
      </p>
      <Link
        to="/lugares"
        className="mt-6 inline-block text-sm font-medium text-secondary hover:underline"
      >
        Volver al listado
      </Link>
    </div>
  )
}
