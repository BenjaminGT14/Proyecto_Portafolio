import { MapaLazy as Mapa } from '@/view/components/MapaLazy'
import { useMapaViewModel } from '@/viewmodel/public/useMapaViewModel'
import { cn } from '@/core/utils'

export function MapaPage() {
  const vm = useMapaViewModel()

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Mapa de Santiago</h1>
        <p className="text-sm text-slate-600">
          Explora lugares y eventos georeferenciados. Haz click en cualquier marcador para ver el detalle.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {vm.tipos.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => vm.setTipo(t.id)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              vm.tipo === t.id
                ? 'bg-secondary text-white'
                : 'border border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-low',
            )}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-slate-500">
          {vm.loading ? 'Cargando…' : `${vm.puntos.length} puntos`}
        </span>
      </div>

      <Mapa puntos={vm.puntos} altura="h-[70vh]" />

      <Leyenda />
    </div>
  )
}

function Leyenda() {
  return (
    <div className="flex flex-wrap gap-4 rounded-xl border border-outline-variant bg-white px-4 py-3 text-sm text-on-surface-variant">
      <span className="flex items-center gap-2">
        <span className="inline-block size-3 rounded-full bg-secondary" />
        Lugar
      </span>
      <span className="flex items-center gap-2">
        <span className="inline-block size-3 rounded-full bg-secondary-container" />
        Evento
      </span>
    </div>
  )
}
