import { useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Link } from 'react-router-dom'
import { cn } from '@/core/utils'

// ── Constantes ────────────────────────────────────────────────────────────────

const SANTIAGO_LAT = -33.4489
const SANTIAGO_LNG = -70.6693
const SIN_PUNTOS = [] // referencia estable → evita re-renders innecesarios

// ── Iconos SVG personalizados ─────────────────────────────────────────────────
// L.divIcon permite SVG inline sin depender de archivos de imagen externos,
// lo que evita el bug clásico de Leaflet + bundlers con rutas de assets.

function crearIcono(relleno) {
  return L.divIcon({
    className: '',   // sin clase por defecto de Leaflet (que añade fondo blanco)
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="30" viewBox="0 0 22 30">
      <path d="M11 0C4.925 0 0 4.925 0 11c0 8.25 11 19 11 19S22 19.25 22 11 17.075 0 11 0z"
            fill="${relleno}" stroke="rgba(0,0,0,.18)" stroke-width=".5"/>
      <circle cx="11" cy="11" r="4" fill="white"/>
    </svg>`,
    iconSize:    [22, 30],
    iconAnchor:  [11, 30], // punta del pin coincide con la coordenada
    popupAnchor: [0, -32], // popup aparece justo encima del pin
  })
}

const iconoLugar  = crearIcono('#00658d') // azul  – lugares
const iconoEvento = crearIcono('#00baff') // cian  – eventos

// ── Componente auxiliar: react-leaflet v5 ────────────────────────────────────
// useMap() solo puede usarse dentro del árbol de MapContainer.
// Recibe lat/lng como primitivos (no array) para que useEffect compare
// correctamente los valores y no dispare en cada render.

function ControladorVista({ lat, lng, zoom }) {
  const map = useMap()

  useEffect(() => {
    map.setView([lat, lng], zoom, { animate: true, duration: 0.35 })
  }, [map, lat, lng, zoom])

  return null
}

// ── Componente principal ──────────────────────────────────────────────────────

/**
 * Mapa interactivo usando react-leaflet v5 + OpenStreetMap.
 * No requiere API key.
 *
 * Props:
 *   puntos  — [{ id, nombre, latitud, longitud, comuna, tipo: 'lugar'|'evento' }]
 *   centro  — { lat, lng }  centro explícito (opcional; si no se pasa usa el primer punto)
 *   zoom    — nivel de zoom inicial  (default 12)
 *   altura  — clase Tailwind de altura  (default 'h-96')
 */
export function Mapa({ puntos = SIN_PUNTOS, centro, zoom = 12, altura = 'h-96' }) {

  // Filtra puntos sin coordenadas válidas
  const puntosValidos = useMemo(
    () => puntos.filter((p) => p && Number.isFinite(p.latitud) && Number.isFinite(p.longitud)),
    [puntos],
  )

  // Calcula lat/lng como primitivos para que useMemo y ControladorVista
  // comparen valores, no referencias.
  const { lat, lng } = useMemo(() => {
    if (centro && Number.isFinite(centro.lat) && Number.isFinite(centro.lng)) {
      return { lat: centro.lat, lng: centro.lng }
    }
    const p = puntosValidos[0]
    return p
      ? { lat: p.latitud, lng: p.longitud }
      : { lat: SANTIAGO_LAT, lng: SANTIAGO_LNG }
  }, [centro, puntosValidos])

  return (
    <div className={cn('relative isolate w-full overflow-hidden rounded-xl border border-slate-200', altura)}>
      {/*
        center/zoom son solo el estado inicial de MapContainer.
        ControladorVista se encarga de actualizar la vista cuando cambian.
      */}
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        scrollWheelZoom
        keyboard={false}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Actualiza la vista cuando lat/lng/zoom cambian tras el montaje */}
        <ControladorVista lat={lat} lng={lng} zoom={zoom} />

        {/* Tiles de OpenStreetMap — gratuitos, sin API key */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
          maxZoom={19}
        />

        {/* Marcadores */}
        {puntosValidos.map((p) => (
          <Marker
            key={`${p.tipo}-${p.id}`}
            position={[p.latitud, p.longitud]}
            icon={p.tipo === 'evento' ? iconoEvento : iconoLugar}
          >
            <Popup minWidth={170}>
              <div className="space-y-1 font-sans">
                <p className="text-sm font-semibold leading-snug text-slate-900">
                  {p.nombre}
                </p>
                {p.comuna && (
                  <p className="text-xs text-slate-500">{p.comuna}</p>
                )}
                <Link
                  to={`/${p.tipo === 'evento' ? 'eventos' : 'lugares'}/${p.id}`}
                  className="inline-block pt-1 text-xs font-semibold text-[#c04f23] hover:underline"
                >
                  Ver detalle →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
