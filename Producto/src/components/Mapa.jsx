import { useMemo, useState } from 'react'
import { APIProvider, Map, AdvancedMarker, InfoWindow, Pin } from '@vis.gl/react-google-maps'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const MAP_ID = 'entreteca-map'

// centro aproximado de Santiago
const SANTIAGO = { lat: -33.4489, lng: -70.6693 }

/**
 * Mapa interactivo con marcadores.
 *
 * @param {Object} props
 * @param {Array} props.puntos    [{ id, nombre, latitud, longitud, comuna, tipo: 'lugar'|'evento' }]
 * @param {Object} [props.centro] { lat, lng }
 * @param {number} [props.zoom]
 * @param {string} [props.altura] clase de altura tailwind (default h-96)
 */
export function Mapa({ puntos = [], centro, zoom = 12, altura = 'h-96' }) {
  const [seleccion, setSeleccion] = useState(null)

  const puntosValidos = useMemo(
    () => puntos.filter((p) => Number.isFinite(p.latitud) && Number.isFinite(p.longitud)),
    [puntos],
  )

  const centroEfectivo = centro ?? primerCentro(puntosValidos) ?? SANTIAGO

  if (!apiKey) {
    return <MapaSinKey altura={altura} puntos={puntosValidos} />
  }

  return (
    <div className={cn('w-full overflow-hidden rounded-xl border border-slate-200', altura)}>
      <APIProvider apiKey={apiKey}>
        <Map
          mapId={MAP_ID}
          defaultCenter={centroEfectivo}
          defaultZoom={zoom}
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          {puntosValidos.map((p) => (
            <AdvancedMarker
              key={`${p.tipo}-${p.id}`}
              position={{ lat: p.latitud, lng: p.longitud }}
              onClick={() => setSeleccion(p)}
            >
              <Pin
                background={p.tipo === 'evento' ? '#00baff' : '#00658d'}
                borderColor="#004663"
                glyphColor="#ffffff"
              />
            </AdvancedMarker>
          ))}

          {seleccion && (
            <InfoWindow
              position={{ lat: seleccion.latitud, lng: seleccion.longitud }}
              onCloseClick={() => setSeleccion(null)}
            >
              <div className="min-w-[180px] space-y-1 p-1 font-sans">
                <p className="text-sm font-semibold text-slate-900">{seleccion.nombre}</p>
                {seleccion.comuna && (
                  <p className="text-xs text-slate-600">{seleccion.comuna}</p>
                )}
                <Link
                  to={`/${seleccion.tipo === 'evento' ? 'eventos' : 'lugares'}/${seleccion.id}`}
                  className="inline-block text-xs font-medium text-secondary hover:underline"
                >
                  Ver detalle →
                </Link>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  )
}

function primerCentro(puntos) {
  const p = puntos[0]
  if (!p) return null
  return { lat: p.latitud, lng: p.longitud }
}

function MapaSinKey({ altura, puntos }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center',
        altura,
      )}
    >
      <MapPin className="h-8 w-8 text-slate-400" />
      <div>
        <p className="text-sm font-semibold text-slate-700">Mapa interactivo</p>
        <p className="text-xs text-slate-500">
          Configura <code className="rounded bg-slate-200 px-1">VITE_GOOGLE_MAPS_API_KEY</code> en{' '}
          <code className="rounded bg-slate-200 px-1">.env.local</code> para activarlo.
        </p>
      </div>
      <p className="text-xs text-slate-500">{puntos.length} punto{puntos.length === 1 ? '' : 's'} listo{puntos.length === 1 ? '' : 's'} para mostrar.</p>
    </div>
  )
}
