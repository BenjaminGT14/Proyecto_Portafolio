import { useCallback } from 'react'
import { listarFavoritos } from '@/model/entretecaRepository'
import { useAuth } from '@/core/auth/useAuth'
import { useAsyncData } from '@/viewmodel/shared/useAsyncData'

export function useFavoritosViewModel() {
  const { user } = useAuth()
  const cargarFavoritos = useCallback(
    () => listarFavoritos({ idUsuario: user?.id }),
    [user?.id],
  )
  const { data, loading } = useAsyncData(cargarFavoritos)
  const lugares = data?.lugares ?? []
  const eventos = data?.eventos ?? []

  return {
    lugares,
    eventos,
    total: lugares.length + eventos.length,
    loading,
  }
}
