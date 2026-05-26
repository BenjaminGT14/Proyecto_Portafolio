import { useMemo, useState } from 'react'
import { MapaLazy as Mapa } from '@/components/MapaLazy'
import { listarLugares, listarEventos } from '@/lib/api'
import { useAsyncData } from '@/hooks/useAsyncData'
import { cn } from '@/lib/utils'

const TIPOS = [
  { id: 'todos', label: 'Todos' },
  { id: 'lugar', label: 'Lugares' },
  { id: 'evento', label: 'Eventos' },
]

export function MapaPage() {
  const [tipo, setTipo] = useState('todos')

  const { data: lugares, loading: l1 } = useAsyncData(() => listarLugares(), [])
  const { data: eventos, loading: l2 } = useAsyncData(() => listarEventos(), [])

  const puntos = useMemo(() => {
    const p = []
    if (tipo !== 'evento') {
      for (const l of lugares ?? []) {
        p.push({
          id: l.id_lugar,
          nombre: l.nombre,
          latitud: l.latitud,
          longitud: l.longitud,
          comuna: l.comuna,
          tipo: 'lugar',
        })
      }
    }
    if (tipo !== 'lugar') {
      for (const e of eventos ?? []) {
        if (!e.lugar) continue
        p.push({
          id: e.id_evento,
          nombre: e.nombre,
          latitud: e.lugar.latitud,
          longitud: e.lugar.longitud,
          comuna: e.lugar.comuna,
          tipo: 'evento',
        })
      }
    }
    return p
  }, [lugares, eventos, tipo])

  const loading = l1 || l2

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Mapa de Santiago</h1>
        <p className="text-sm text-slate-600">
          Explora lugares y eventos georeferenciados. Haz click en cualquier marcador para ver el detalle.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {TIPOS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTipo(t.id)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              tipo === t.id
                ? 'bg-secondary text-white'
                : 'border border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-low',
            )}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-slate-500">
          {loading ? 'Cargando…' : `${puntos.length} puntos`}
        </span>
      </div>

      <Mapa puntos={puntos} altura="h-[70vh]" />

      <Leyenda />
    </div>
  )
}

function Leyenda() {
  return (
    <div className="flex flex-wrap gap-4 rounded-xl border border-outline-variant bg-white px-4 py-3 text-sm text-on-surface-variant">
      <span className="flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-full bg-secondary" />
        Lugar
      </span>
      <span className="flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-full bg-secondary-container" />
        Evento
      </span>
    </div>
  )
}
