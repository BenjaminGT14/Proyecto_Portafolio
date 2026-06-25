import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/core/auth/useAuth'

/**
 * Encapsula el cierre de sesión con confirmación. Reutilizable por los distintos
 * puntos de logout (Header, Perfil, AdminLayout) sin duplicar la lógica: cada
 * vista conserva su propio botón y solo renderiza un <ConfirmDialog> con el
 * estado expuesto aquí.
 *
 * @param {string} destino ruta a la que navegar tras cerrar sesión (def. '/').
 */
export function useLogout(destino = '/') {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  const pedirConfirmacion = useCallback(() => setConfirming(true), [])
  const cancelar = useCallback(() => {
    if (!loading) setConfirming(false)
  }, [loading])

  const confirmar = useCallback(async () => {
    setLoading(true)
    await signOut()
    setLoading(false)
    setConfirming(false)
    navigate(destino)
  }, [signOut, navigate, destino])

  return { confirming, loading, pedirConfirmacion, cancelar, confirmar }
}
