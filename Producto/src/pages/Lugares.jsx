import { useState } from 'react'
import { LugarCard } from '@/components/LugarCard'
import { FiltrosBar } from '@/components/FiltrosBar'
import { listarCategorias, listarLugares } from '@/lib/api'
import { useAsyncData } from '@/hooks/useAsyncData'

export function LugaresPage() {
  const [filtros, setFiltros] = useState({})

  const { data: categorias } = useAsyncData(() => listarCategorias(), [])
  const { data: lugares, loading, error } = useAsyncData(
    () => listarLugares(filtros),
    [filtros.idCategoria, filtros.comuna, filtros.costo, filtros.q],
  )

  const items = lugares ?? []

  return (
    <div className="space-y-6">
      <header className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end sm:gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Lugares en Santiago</h1>
          <p className="mt-1 text-sm text-slate-600">
            Parques, museos, teatros y rincones con historia.
          </p>
        </div>
        <p className="text-sm text-slate-500">
          {items.length} resultado{items.length === 1 ? '' : 's'}
        </p>
      </header>

      <FiltrosBar
        categorias={categorias ?? []}
        filtros={filtros}
        setFiltros={setFiltros}
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message ?? 'Error cargando lugares'}
        </div>
      )}

      {loading ? (
        <SkeletonGrid />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((lugar) => (
            <LugarCard key={lugar.id_lugar} lugar={lugar} />
          ))}
        </div>
      )}
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="aspect-[16/10] animate-pulse bg-slate-200" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
            <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-slate-600">
        No encontramos lugares con esos filtros. Prueba quitando alguno.
      </p>
    </div>
  )
}
