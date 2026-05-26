import { Icon } from '@/components/ui/Icon'
import { Estrellas } from './Estrellas'
import { cn, avatarUrl } from '@/lib/utils'

function fechaRelativa(iso) {
  if (!iso) return ''
  const fecha = new Date(iso)
  const diff = Date.now() - fecha.getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'Hace un momento'
  if (min < 60) return `Hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `Hace ${h} h`
  const d = Math.floor(h / 24)
  if (d === 1) return 'Ayer'
  if (d < 7) return `Hace ${d} días`
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' }).format(fecha)
}

export function ResenaCard({ resena, votoUsuario, onVotar, disabled }) {
  const autor = resena.autor ?? {}
  const fallback = avatarUrl(autor.nombre ?? 'Usuario')

  return (
    <article className="relative rounded-xl border border-outline-variant bg-white p-6 shadow-sm">
      <header className="mb-4 flex items-center gap-3">
        <img
          src={autor.avatar_url || fallback}
          alt={autor.nombre ?? 'Usuario'}
          className="h-12 w-12 rounded-full bg-secondary object-cover"
          onError={(e) => {
            if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback
          }}
        />
        <div>
          <p className="text-sm font-semibold">{autor.nombre ?? 'Usuario'}</p>
          <p className="text-[10px] uppercase tracking-wide text-outline">
            {fechaRelativa(resena.created_at)}
          </p>
        </div>
      </header>

      <div className="mb-3 flex items-center gap-3">
        <Estrellas value={resena.puntuacion} />
        <span className="text-sm font-semibold text-on-surface">{resena.titulo}</span>
      </div>

      <p className="mb-6 text-sm italic leading-relaxed text-on-surface-variant">
        “{resena.contenido}”
      </p>

      <footer className="flex items-center gap-4">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onVotar?.(true)}
          className={cn(
            'flex items-center gap-1 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
            votoUsuario?.es_positivo === true
              ? 'font-bold text-secondary'
              : 'text-outline hover:text-secondary',
          )}
          aria-label="Voto positivo"
        >
          <Icon name="thumb_up" size="sm" filled={votoUsuario?.es_positivo === true} />
          {resena.votos_positivos}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onVotar?.(false)}
          className={cn(
            'flex items-center gap-1 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
            votoUsuario?.es_positivo === false
              ? 'font-bold text-error'
              : 'text-outline hover:text-error',
          )}
          aria-label="Voto negativo"
        >
          <Icon name="thumb_down" size="sm" filled={votoUsuario?.es_positivo === false} />
          {resena.votos_negativos}
        </button>
      </footer>
    </article>
  )
}
