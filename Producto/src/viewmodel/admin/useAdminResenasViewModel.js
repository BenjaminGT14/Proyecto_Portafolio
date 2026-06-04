import { useCallback, useState } from 'react'
import { cambiarEstadoResena, listarResenasAdmin } from '@/model/entretecaRepository'
import { useAsyncData } from '@/viewmodel/shared/useAsyncData'

export const ESTADOS_RESENA = ['visible', 'oculta', 'eliminada']

export function useAdminResenasViewModel() {
  const [refresh, setRefresh] = useState(0)
  const bump = useCallback(() => setRefresh((n) => n + 1), [])
  const cargarResenas = useCallback(() => listarResenasAdmin(), [])
  const { data: resenas, loading } = useAsyncData(cargarResenas, refresh)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [saving, setSaving] = useState(null)
  const registros = resenas ?? []

  async function cambiarEstado(idResena, estado) {
    setSaving(idResena)
    await cambiarEstadoResena({ idResena, estado })
    setSaving(null)
    bump()
  }

  return {
    resenas: registros,
    lista: registros.filter((r) => filtroEstado === 'todos' || r.estado === filtroEstado),
    loading,
    filtroEstado,
    setFiltroEstado,
    saving,
    cambiarEstado,
  }
}
