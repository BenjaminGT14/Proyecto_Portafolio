import { useCallback, useState } from 'react'
import { listarEventos } from '@/model/eventoutRepository'
import { comunasSantiago } from '@/model/mockData'
import { useAsyncData } from '@/viewmodel/shared/useAsyncData'

export function useEventosViewModel() {
  const [filtros, setFiltros] = useState({})
  const cargarEventos = useCallback(() => listarEventos(filtros), [filtros])
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
