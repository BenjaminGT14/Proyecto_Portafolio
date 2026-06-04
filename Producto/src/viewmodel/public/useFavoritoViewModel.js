import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obtenerEstadoFavoritos, toggleFavorito } from '@/model/entretecaRepository'
import { useAuth } from '@/core/auth/useAuth'

export function useFavoritoViewModel({ idLugar, idEvento }) {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  // Guardamos a qué usuario pertenece "activo" y lo DERIVAMOS en render: si
  // cambia el usuario, vuelve a false solo, sin ajustar estado dentro del efecto
  // (lo que mostraría el valor equivocado por un render).
  const [estado, setEstado] = useState({ activo: false, forUser: null })
  const [submitting, setSubmitting] = useState(false)

  const activo = estado.forUser === user?.id ? estado.activo : false

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    obtenerEstadoFavoritos({
      idUsuario: user.id,
      idLugares: idLugar ? [idLugar] : [],
      idEventos: idEvento ? [idEvento] : [],
    }).then(({ data }) => {
      if (cancelled) return
      const fav = idLugar ? data.lugares.has(idLugar) : data.eventos.has(idEvento)
      setEstado({ activo: fav, forUser: user.id })
    })
    return () => {
      cancelled = true
    }
  }, [user?.id, idLugar, idEvento])

  async function toggle() {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (submitting) return
    setSubmitting(true)
    const prev = activo
    setEstado({ activo: !prev, forUser: user.id })
    const res = await toggleFavorito({ idUsuario: user.id, idLugar, idEvento })
    setEstado({ activo: res.error ? prev : res.data.activo, forUser: user.id })
    setSubmitting(false)
  }

  return { activo, submitting, toggle }
}
