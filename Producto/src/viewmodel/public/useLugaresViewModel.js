import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listarCategorias, listarLugares } from '@/model/entretecaRepository'
import { comunasSantiago } from '@/model/comunas'
import { useAsyncData } from '@/viewmodel/shared/useAsyncData'
import { useDebouncedValue } from '@/viewmodel/shared/useDebouncedValue'

// Lee los filtros iniciales desde la URL (?q=...&idCategoria=...&comuna=...&costo=...)
// para que la búsqueda lanzada desde el Home llegue ya aplicada al listado.
function filtrosDesdeParams(searchParams) {
  const filtros = {}
  for (const key of ['q', 'idCategoria', 'comuna', 'costo']) {
    const valor = searchParams.get(key)
    if (valor) filtros[key] = valor
  }
  return filtros
}

export function useLugaresViewModel() {
  const [searchParams] = useSearchParams()
  const [filtros, setFiltros] = useState(() => filtrosDesdeParams(searchParams))
  // Agrupamos los cambios de filtro (sobre todo el texto) para no disparar un
  // request por cada pulsación.
  const filtrosBuscar = useDebouncedValue(filtros, 300)

  const cargarCategorias = useCallback(() => listarCategorias(), [])
  const cargarLugares = useCallback(() => listarLugares(filtrosBuscar), [filtrosBuscar])
  const { data: categorias } = useAsyncData(cargarCategorias)
  const { data: lugares, loading, error } = useAsyncData(cargarLugares)

  return {
    filtros,
    setFiltros,
    comunas: comunasSantiago,
    categorias: categorias ?? [],
    items: lugares ?? [],
    loading,
    error,
  }
}
