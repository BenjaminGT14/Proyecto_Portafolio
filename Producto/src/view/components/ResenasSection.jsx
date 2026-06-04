import { Link } from 'react-router-dom'
import { Icon } from '@/view/components/ui/Icon'
import { Button } from '@/view/components/ui/Button'
import { ResenaCard } from './ResenaCard'
import { ResenaForm } from './ResenaForm'
import { Estrellas } from './Estrellas'
import { useResenasViewModel } from '@/viewmodel/public/useResenasViewModel'

/**
 * Sección reutilizable de reseñas con votación.
 *
 * @param {Object} props
 * @param {string} [props.idLugar]
 * @param {string} [props.idEvento]
 */
export function ResenasSection({ idLugar, idEvento }) {
  const vm = useResenasViewModel({ idLugar, idEvento })

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Icon name="forum" size="md" />
            Reseñas
            <span className="text-base font-normal text-outline">
              ({vm.resenas.length})
            </span>
          </h2>
          {vm.promedio != null && (
            <div className="mt-2 flex items-center gap-2">
              <Estrellas value={Math.round(vm.promedio)} />
              <span className="text-sm text-on-surface-variant">
                {vm.promedio.toFixed(1)} promedio
              </span>
            </div>
          )}
        </div>

        {vm.isAuthenticated ? (
          <Button
            variant={vm.verForm ? 'outline' : 'secondary'}
            onClick={() => vm.setVerForm((v) => !v)}
          >
            <Icon name={vm.verForm ? 'close' : 'edit'} size="sm" />
            {vm.verForm ? 'Cancelar' : 'Escribir reseña'}
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

      {vm.verForm && vm.isAuthenticated && (
        <ResenaForm onSubmit={vm.handlePublicar} submitting={vm.submitting} />
      )}

      {vm.loading ? (
        <SkeletonResenas />
      ) : vm.resenas.length === 0 ? (
        <EmptyResenas />
      ) : (
        <div className="space-y-4">
          {vm.resenas.map((r) => (
            <ResenaCard
              key={r.id_resena}
              resena={r}
              votoUsuario={vm.votoPorResena.get(r.id_resena)}
              disabled={!vm.isAuthenticated}
              onVotar={(esPositivo) => vm.handleVotar(r.id_resena, esPositivo)}
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
            <div className="size-12 animate-pulse rounded-full bg-surface-container-high" />
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
