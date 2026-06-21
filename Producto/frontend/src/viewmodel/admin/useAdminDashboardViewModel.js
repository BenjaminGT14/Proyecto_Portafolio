import { useCallback } from 'react'
import { listarEventosAdmin, listarLugares, listarResenasAdmin } from '@/model/eventoutRepository'
import { useAsyncData } from '@/viewmodel/shared/useAsyncData'

export function useAdminDashboardViewModel() {
  const cargarLugares = useCallback(() => listarLugares(), [])
  const cargarEventos = useCallback(() => listarEventosAdmin(), [])
  const cargarResenas = useCallback(() => listarResenasAdmin(), [])
  const { data: lugares } = useAsyncData(cargarLugares)
  const { data: eventos } = useAsyncData(cargarEventos)
  const { data: resenas } = useAsyncData(cargarResenas)

  const lugaresArr = lugares ?? []
  const eventosArr = eventos ?? []
  const resenasArr = resenas ?? []

  return {
    lugares: lugaresArr,
    eventos: eventosArr,
    resenas: resenasArr,
    eventosPendientes: eventosArr.filter((e) => e.estado === 'pendiente').length,
    pendientes: resenasArr.filter((r) => r.estado !== 'visible').length,
    visibles: resenasArr.filter((r) => r.estado === 'visible').length,
  }
}
