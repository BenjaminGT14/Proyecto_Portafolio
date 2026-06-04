import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listarEventos } from '@/model/entretecaRepository'
import { comunasSantiago } from '@/model/comunas'
import { useAsyncData } from '@/viewmodel/shared/useAsyncData'
import { useDebouncedValue } from '@/viewmodel/shared/useDebouncedValue'

// Filtros iniciales desde la URL (?q=...&comuna=...&costo=...&desde=...).
function filtrosDesdeParams(searchParams) {
  const filtros = {}
  for (const key of ['q', 'comuna', 'costo', 'desde']) {
    const valor = searchParams.get(key)
    if (valor) filtros[key] = valor
  }
  return filtros
}

export function useEventosViewModel() {
  const [searchParams] = useSearchParams()
  const [filtros, setFiltros] = useState(() => filtrosDesdeParams(searchParams))
  const filtrosBuscar = useDebouncedValue(filtros, 300)

  const cargarEventos = useCallback(() => listarEventos(filtrosBuscar), [filtrosBuscar])
  const { data: eventos, loading, error } = useAsyncData(cargarEventos)

  return {
    filtros,
    setFiltros,
    comunas: comunasSantiago,
    items: eventos ?? [],
    loading,
    error,
  }
}
