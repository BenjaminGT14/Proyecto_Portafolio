import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { obtenerEvento } from '@/model/eventoutRepository'
import { imgPlaceholder } from '@/core/utils'
import { useAsyncData } from '@/viewmodel/shared/useAsyncData'

export function useEventoDetalleViewModel() {
  const { id } = useParams()
  const cargarEvento = useCallback(() => obtenerEvento(id), [id])
  const { data: evento, loading, error } = useAsyncData(cargarEvento)
  const lugar = evento?.lugar
  const punto = lugar && Number.isFinite(lugar.latitud) && Number.isFinite(lugar.longitud)
    ? {
        id: evento.id_evento,
        nombre: evento.nombre,
        latitud: lugar.latitud,
        longitud: lugar.longitud,
        comuna: lugar.comuna,
        tipo: 'evento',
      }
    : null

  return {
    evento,
    lugar,
    punto,
    loading,
    error,
    fallback: evento ? imgPlaceholder(evento.id_evento, 1600, 700) : '',
  }
}
