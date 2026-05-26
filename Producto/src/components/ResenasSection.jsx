import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { ResenaCard } from './ResenaCard'
import { ResenaForm } from './ResenaForm'
import { Estrellas } from './Estrellas'
import { useAuth } from '@/hooks/useAuth'
import {
  listarResenas,
  publicarResena,
  votarResena,
  obtenerVotosUsuario,
} from '@/lib/api'

/**
 * Sección reutilizable de reseñas con votación.
 *
 * @param {Object} props
 * @param {string} [props.idLugar]
 * @param {string} [props.idEvento]
 */
export function ResenasSection({ idLugar, idEvento }) {
  const { user, isAuthenticated } = useAuth()
  const [resenas, setResenas] = useState([])
  const [votos, setVotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [verForm, setVerForm] = useState(false)

  const userId = user?.id
  const cargarResenas = useCallback(async () => {
    setLoading(true)
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
    setLoading(false)
  }, [idLugar, idEvento, userId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarResenas()
  }, [cargarResenas])

  const promedio = useMemo(() => {
    if (!resenas.length) return null
    const suma = resenas.reduce((acc, r) => acc + r.puntuacion, 0)
    return suma / resenas.length
  }, [resenas])

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

  const votoPorResena = useMemo(() => {
    const m = new Map()
    votos.forEach((v) => m.set(v.id_resena, v))
    return m
  }, [votos])

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Icon name="forum" size="md" />
            Reseñas
            <span className="text-base font-normal text-outline">
              ({resenas.length})
            </span>
          </h2>
          {promedio != null && (
            <div className="mt-2 flex items-center gap-2">
              <Estrellas value={Math.round(promedio)} />
              <span className="text-sm text-on-surface-variant">
                {promedio.toFixed(1)} promedio
              </span>
            </div>
          )}
        </div>

        {isAuthenticated ? (
          <Button
            variant={verForm ? 'outline' : 'secondary'}
            onClick={() => setVerForm((v) => !v)}
          >
            <Icon name={verForm ? 'close' : 'edit'} size="sm" />
            {verForm ? 'Cancelar' : 'Escribir reseña'}
          </Button>
        ) : (
          <Link
            to="/login"
            className="inline-flex items-center gap-1 rounded-lg border border-outline-variant bg-white px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container-low"
          >
            <Icon name="login" size="sm" />
            Ingresa para escribir
          </Link>
        )}
      </header>

      {verForm && isAuthenticated && (
        <ResenaForm onSubmit={handlePublicar} submitting={submitting} />
      )}

      {loading ? (
        <SkeletonResenas />
      ) : resenas.length === 0 ? (
        <EmptyResenas />
      ) : (
        <div className="space-y-4">
          {resenas.map((r) => (
            <ResenaCard
              key={r.id_resena}
              resena={r}
              votoUsuario={votoPorResena.get(r.id_resena)}
              disabled={!isAuthenticated}
              onVotar={(esPositivo) => handleVotar(r.id_resena, esPositivo)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function SkeletonResenas() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-outline-variant bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-12 w-12 animate-pulse rounded-full bg-surface-container-high" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 animate-pulse rounded bg-surface-container-high" />
              <div className="h-2 w-20 animate-pulse rounded bg-surface-container-high" />
            </div>
          </div>
          <div className="h-3 w-full animate-pulse rounded bg-surface-container-high" />
          <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-surface-container-high" />
        </div>
      ))}
    </div>
  )
}

function EmptyResenas() {
  return (
    <div className="rounded-xl border border-dashed border-outline-variant bg-white p-10 text-center">
      <Icon name="forum" size="lg" className="text-outline" />
      <p className="mt-3 text-sm text-on-surface-variant">
        Aún no hay reseñas. ¡Sé el primero en compartir tu experiencia!
      </p>
    </div>
  )
}
