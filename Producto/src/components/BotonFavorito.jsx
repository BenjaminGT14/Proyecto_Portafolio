import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/hooks/useAuth'
import { obtenerEstadoFavoritos, toggleFavorito } from '@/lib/api'
import { cn } from '@/lib/utils'

/**
 * Botón corazón para favoritar un lugar o evento.
 * Si no hay sesión, redirige a /login al hacer click.
 *
 * Props mutuamente excluyentes: idLugar o idEvento.
 */
export function BotonFavorito({ idLugar, idEvento, size = 'sm', className }) {
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

  async function handleClick(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (submitting) return
    setSubmitting(true)
    const prev = activo
    setActivo(!prev) // optimistic
    const res = await toggleFavorito({ idUsuario: user.id, idLugar, idEvento })
    if (res.error) setActivo(prev) // rollback
    else setActivo(res.data.activo)
    setSubmitting(false)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={submitting}
      aria-label={activo ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      className={cn(
        'inline-flex items-center justify-center transition-transform hover:scale-110',
        activo ? 'text-error' : 'text-outline hover:text-error',
        className,
      )}
    >
      <Icon name="favorite" size={size} filled={activo} />
    </button>
  )
}
