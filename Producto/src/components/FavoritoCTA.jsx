import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/hooks/useAuth'
import { obtenerEstadoFavoritos, toggleFavorito } from '@/lib/api'
import { cn } from '@/lib/utils'

/**
 * Botón CTA "Guardar en favoritos" full-width, ideal para paneles
 * laterales en páginas de detalle.
 *
 * Props mutuamente excluyentes: idLugar o idEvento.
 */
export function FavoritoCTA({ idLugar, idEvento }) {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [activo, setActivo] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!user?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActivo(false)
      return
    }
    obtenerEstadoFavoritos({
      idUsuario: user.id,
      idLugares: idLugar ? [idLugar] : [],
      idEventos: idEvento ? [idEvento] : [],
    }).then(({ data }) => {
      if (cancelled) return
      if (idLugar) setActivo(data.lugares.has(idLugar))
      else if (idEvento) setActivo(data.eventos.has(idEvento))
    })
    return () => {
      cancelled = true
    }
  }, [user?.id, idLugar, idEvento])

  async function handleClick() {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (submitting) return
    setSubmitting(true)
    const prev = activo
    setActivo(!prev)
    const res = await toggleFavorito({ idUsuario: user.id, idLugar, idEvento })
    if (res.error) setActivo(prev)
    else setActivo(res.data.activo)
    setSubmitting(false)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={submitting}
      className={cn(
        'inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-60',
        activo
          ? 'border-error bg-error-container text-on-error-container hover:brightness-105'
          : 'border-outline-variant bg-white text-on-surface hover:bg-surface-container-low',
      )}
    >
      <Icon name="favorite" size="sm" filled={activo} className={activo ? 'text-error' : ''} />
      {activo ? 'En tus favoritos' : 'Guardar en favoritos'}
    </button>
  )
}
