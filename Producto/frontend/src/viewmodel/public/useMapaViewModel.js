import { useCallback, useMemo, useState } from 'react'
import { listarEventos, listarLugares } from '@/model/eventoutRepository'
import { useAsyncData } from '@/viewmodel/shared/useAsyncData'

const TIPOS_MAPA = [
  { id: 'todos', label: 'Todos' },
  { id: 'lugar', label: 'Lugares' },
  { id: 'evento', label: 'Eventos' },
]

export function useMapaViewModel() {
  const [tipo, setTipo] = useState('todos')
  const cargarLugares = useCallback(() => listarLugares(), [])
  const cargarEventos = useCallback(() => listarEventos(), [])
  const { data: lugares, loading: lugaresLoading } = useAsyncData(cargarLugares)
  const { data: eventos, loading: eventosLoading } = useAsyncData(cargarEventos)

  const puntos = useMemo(() => {
    const items = []
    if (tipo !== 'evento') {
      for (const lugar of lugares ?? []) {
        items.push({
          id: lugar.id_lugar,
          nombre: lugar.nombre,
          latitud: lugar.latitud,
          longitud: lugar.longitud,
          comuna: lugar.comuna,
          tipo: 'lugar',
        })
      }
    }
    if (tipo !== 'lugar') {
      for (const evento of eventos ?? []) {
        if (!evento.lugar) continue
        items.push({
          id: evento.id_evento,
          nombre: evento.nombre,
          latitud: evento.lugar.latitud,
          longitud: evento.lugar.longitud,
          comuna: evento.lugar.comuna,
          tipo: 'evento',
        })
      }
    }
    return items
  }, [lugares, eventos, tipo])

  return {
    tipo,
    setTipo,
    tipos: TIPOS_MAPA,
    puntos,
    loading: lugaresLoading || eventosLoading,
  }
}
