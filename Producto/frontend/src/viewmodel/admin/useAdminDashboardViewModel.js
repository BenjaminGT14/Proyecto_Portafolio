import { useCallback } from 'react'
import { listarEventos, listarLugares, listarResenasAdmin } from '@/model/entretecaRepository'
import { useAsyncData } from '@/viewmodel/shared/useAsyncData'

export function useAdminDashboardViewModel() {
  const cargarLugares = useCallback(() => listarLugares(), [])
  const cargarEventos = useCallback(() => listarEventos(), [])
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
    pendientes: resenasArr.filter((r) => r.estado !== 'visible').length,
    visibles: resenasArr.filter((r) => r.estado === 'visible').length,
  }
}
