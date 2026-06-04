import { useCallback, useState } from 'react'
import { listarCategorias, listarLugares } from '@/model/entretecaRepository'
import { comunasSantiago } from '@/model/mockData'
import { useAsyncData } from '@/viewmodel/shared/useAsyncData'

export function useLugaresViewModel() {
  const [filtros, setFiltros] = useState({})
  const cargarCategorias = useCallback(() => listarCategorias(), [])
  const cargarLugares = useCallback(() => listarLugares(filtros), [filtros])
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
