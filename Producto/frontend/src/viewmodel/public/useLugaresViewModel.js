import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listarCategorias, listarLugares } from '@/model/eventoutRepository'
import { comunasSantiago } from '@/model/mockData'
import { useAsyncData } from '@/viewmodel/shared/useAsyncData'

// Lee los filtros iniciales desde la URL (?idCategoria=&comuna=&costo=&q=) para que
// los enlaces del Home ("Explora por categorías" y el buscador del hero) lleguen a
// esta página ya filtrados.
function filtrosDesdeUrl(searchParams) {
  const filtros = {}
  for (const key of ['idCategoria', 'comuna', 'costo', 'q']) {
    const valor = searchParams.get(key)
    if (valor) filtros[key] = valor
  }
  return filtros
}

export function useLugaresViewModel() {
  const [searchParams] = useSearchParams()
  const urlKey = searchParams.toString()
  const [filtros, setFiltros] = useState(() => filtrosDesdeUrl(searchParams))

  // Re-sincroniza solo cuando cambia la URL (navegar desde el Home o el menú). No se
  // dispara con los cambios locales de FiltrosBar, así esas ediciones se conservan.
  const ultimaUrl = useRef(urlKey)
  useEffect(() => {
    if (ultimaUrl.current === urlKey) return
    ultimaUrl.current = urlKey
    setFiltros(filtrosDesdeUrl(new URLSearchParams(urlKey)))
  }, [urlKey])

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
