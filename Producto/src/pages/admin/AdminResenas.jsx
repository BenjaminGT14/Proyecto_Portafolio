import { useState, useCallback } from 'react'
import { Icon } from '@/components/ui/Icon'
import { listarResenasAdmin, cambiarEstadoResena } from '@/lib/api'
import { useAsyncData } from '@/hooks/useAsyncData'
import { formatFecha } from '@/lib/utils'
import { EstadoBadge } from './AdminDashboard'
import { TableSkeleton } from './AdminLugares'

const ESTADOS = ['visible', 'oculta', 'eliminada']

export function AdminResenasPage() {
  const [refresh, setRefresh] = useState(0)
  const bump = useCallback(() => setRefresh((n) => n + 1), [])

  const { data: resenas, loading } = useAsyncData(() => listarResenasAdmin(), [refresh])

  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [saving, setSaving] = useState(null)

  async function cambiarEstado(idResena, estado) {
    setSaving(idResena)
    await cambiarEstadoResena({ idResena, estado })
    setSaving(null)
    bump()
  }

  const lista = (resenas ?? []).filter(
    (r) => filtroEstado === 'todos' || r.estado === filtroEstado,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Reseñas</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {lista.length} de {(resenas ?? []).length} registros
          </p>
        </div>

        <div className="flex gap-2">
          {['todos', ...ESTADOS].map((e) => (
            <button
              key={e}
              onClick={() => setFiltroEstado(e)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                filtroEstado === e
                  ? 'bg-secondary text-white'
                  : 'border border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <TableSkeleton cols={5} rows={6} />
      ) : (
        <div className="space-y-3">
          {lista.map((r) => (
            <ResenaRow
              key={r.id_resena}
              resena={r}
              onCambiar={cambiarEstado}
              saving={saving === r.id_resena}
            />
          ))}
          {lista.length === 0 && (
            <p className="rounded-2xl border border-outline-variant bg-white py-12 text-center text-sm text-outline">
              Sin reseñas con ese estado.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function ResenaRow({ resena, onCambiar, saving }) {
  const ref = resena.lugar?.nombre ?? resena.evento?.nombre ?? '—'

  return (
    <div className="rounded-2xl border border-outline-variant bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* Autor + título */}
        <div className="flex items-start gap-3">
          {resena.autor?.avatar_url && (
            <img
              src={resena.autor.avatar_url}
              alt={resena.autor.nombre}
              className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
            />
          )}
          <div>
            <p className="text-sm font-semibold text-on-surface">{resena.titulo}</p>
            <p className="text-xs text-outline">
              {resena.autor?.nombre ?? 'Usuario'} · {ref} · {formatFecha(resena.created_at)}
            </p>
          </div>
        </div>

        {/* Estado + acciones */}
        <div className="flex flex-wrap items-center gap-2">
          <EstadoBadge estado={resena.estado} />
          <Estrellas n={resena.puntuacion} />
        </div>
      </div>

      <p className="mt-3 line-clamp-3 text-sm text-on-surface-variant">{resena.contenido}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-outline-variant pt-3">
        <span className="text-xs text-outline">Cambiar estado:</span>
        {ESTADOS.filter((e) => e !== resena.estado).map((e) => (
          <button
            key={e}
            disabled={saving}
            onClick={() => onCambiar(resena.id_resena, e)}
            className={`rounded-lg border px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-60 ${
              e === 'visible'
                ? 'border-secondary/30 bg-secondary/10 text-secondary hover:bg-secondary/20'
                : e === 'eliminada'
                ? 'border-error/30 bg-error-container/20 text-error hover:bg-error-container/40'
                : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {saving ? <Icon name="progress_activity" size="sm" className="animate-spin" /> : e}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-1 text-xs text-outline">
          <Icon name="thumb_up" size="sm" /> {resena.votos_positivos ?? 0}
          <span className="ml-1"><Icon name="thumb_down" size="sm" /></span> {resena.votos_negativos ?? 0}
        </span>
      </div>
    </div>
  )
}

function Estrellas({ n }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          name="star"
          size="sm"
          className={i < n ? 'text-on-tertiary-container' : 'text-outline-variant'}
        />
      ))}
    </div>
  )
}
