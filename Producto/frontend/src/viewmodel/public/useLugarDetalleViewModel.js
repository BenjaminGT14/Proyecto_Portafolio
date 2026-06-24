import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { obtenerLugar } from '@/model/eventoutRepository'
import { imgPlaceholder } from '@/core/utils'
import { useAsyncData } from '@/viewmodel/shared/useAsyncData'

export function useLugarDetalleViewModel() {
  const { id } = useParams()
  const cargarLugar = useCallback(() => obtenerLugar(id), [id])
  const { data: lugar, loading, error } = useAsyncData(cargarLugar)

  return {
    lugar,
    loading,
    error,
    fallback: lugar ? imgPlaceholder(lugar.id_lugar, 1600, 700) : '',
    punto: lugar
      ? {
          id: lugar.id_lugar,
          nombre: lugar.nombre,
          latitud: lugar.latitud,
          longitud: lugar.longitud,
          comuna: lugar.comuna,
          tipo: 'lugar',
        }
      : null,
  }
}
