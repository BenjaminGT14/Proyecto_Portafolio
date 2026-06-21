import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  listarResenasDestacadas,
  obtenerVotosUsuario,
  votarResena,
} from '@/model/eventoutRepository'
import { useAuth } from '@/core/auth/useAuth'

/**
 * Feed global de reseñas destacadas para el Home. Ver es público; votar y escribir
 * requieren sesión (si no, se redirige a /login). El orden por "más likes" lo
 * resuelve el backend (GET /resenas/destacadas, ordenado por score).
 */
export function useResenasDestacadasViewModel({ limit = 6 } = {}) {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [resenas, setResenas] = useState([])
  const [votos, setVotos] = useState([])
  const [loaded, setLoaded] = useState(false)

  const userId = user?.id

  const cargar = useCallback(async () => {
    const { data } = await listarResenasDestacadas({ limit })
    const items = data ?? []
    setResenas(items)

    if (userId && items.length) {
      const { data: votosData } = await obtenerVotosUsuario({
        idUsuario: userId,
        idsResenas: items.map((r) => r.id_resena),
      })
      setVotos(votosData ?? [])
    } else {
      setVotos([])
    }
    setLoaded(true)
  }, [limit, userId])

  useEffect(() => {
    // Carga al montar / cambiar usuario; los setState ocurren tras los await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar()
  }, [cargar])

  const votoPorResena = useMemo(() => {
    const map = new Map()
    votos.forEach((voto) => map.set(voto.id_resena, voto))
    return map
  }, [votos])

  async function handleVotar(idResena, esPositivo) {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    await votarResena({ idUsuario: user.id, idResena, esPositivo })
    cargar()
  }

  // Escribir una reseña requiere elegir un lugar/evento: enviamos al usuario
  // logeado a la lista de lugares (donde está el formulario real); si no, a login.
  function handleEscribir() {
    navigate(isAuthenticated ? '/lugares' : '/login')
  }

  return {
    resenas,
    loading: !loaded,
    isAuthenticated,
    votoPorResena,
    handleVotar,
    handleEscribir,
  }
}
