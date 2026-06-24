import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  listarResenas,
  obtenerVotosUsuario,
  publicarResena,
  votarResena,
} from '@/model/eventoutRepository'
import { useAuth } from '@/core/auth/useAuth'

export function useResenasViewModel({ idLugar, idEvento }) {
  const { user, isAuthenticated } = useAuth()
  const [resenas, setResenas] = useState([])
  const [votos, setVotos] = useState([])
  const [loadedKey, setLoadedKey] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [verForm, setVerForm] = useState(false)

  const userId = user?.id
  const dataKey = `${idLugar ?? ''}|${idEvento ?? ''}|${userId ?? ''}`
  // "loading" se DERIVA en render: es true hasta que los datos cargados
  // correspondan a la combinación actual de lugar/evento/usuario. Así no
  // duplicamos el estado de carga ni pagamos un render extra.
  const loading = loadedKey !== dataKey

  const cargarResenas = useCallback(async () => {
    const { data } = await listarResenas({ idLugar, idEvento })
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
    setLoadedKey(`${idLugar ?? ''}|${idEvento ?? ''}|${userId ?? ''}`)
  }, [idLugar, idEvento, userId])

  useEffect(() => {
    // Carga de datos al montar / cambiar filtros: los setState ocurren tras
    // los await, no de forma síncrona en el cuerpo del efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarResenas()
  }, [cargarResenas])

  const promedio = useMemo(() => {
    if (!resenas.length) return null
    const suma = resenas.reduce((acc, r) => acc + r.puntuacion, 0)
    return suma / resenas.length
  }, [resenas])

  const votoPorResena = useMemo(() => {
    const map = new Map()
    votos.forEach((voto) => map.set(voto.id_resena, voto))
    return map
  }, [votos])

  async function handlePublicar(form) {
    if (!user?.id) return { error: new Error('Debes iniciar sesión') }
    setSubmitting(true)
    const res = await publicarResena({
      idUsuario: user.id,
      idLugar,
      idEvento,
      titulo: form.titulo,
      contenido: form.contenido,
      puntuacion: form.puntuacion,
    })
    setSubmitting(false)
    if (!res.error) {
      setVerForm(false)
      cargarResenas()
    }
    return res
  }

  async function handleVotar(idResena, esPositivo) {
    if (!user?.id) return
    await votarResena({ idUsuario: user.id, idResena, esPositivo })
    cargarResenas()
  }

  return {
    resenas,
    loading,
    submitting,
    verForm,
    setVerForm,
    promedio,
    votoPorResena,
    isAuthenticated,
    handlePublicar,
    handleVotar,
  }
}
