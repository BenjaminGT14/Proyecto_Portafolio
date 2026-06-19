import { Icon } from '@/view/components/ui/Icon'
import { useFavoritoViewModel } from '@/viewmodel/public/useFavoritoViewModel'
import { cn } from '@/core/utils'

/**
 * Botón CTA "Guardar en favoritos" full-width, ideal para paneles
 * laterales en páginas de detalle.
 *
 * Props mutuamente excluyentes: idLugar o idEvento.
 */
export function FavoritoCTA({ idLugar, idEvento }) {
  const vm = useFavoritoViewModel({ idLugar, idEvento })

  return (
    <button
      type="button"
      onClick={vm.toggle}
      disabled={vm.submitting}
      className={cn(
        'inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-60',
        vm.activo
          ? 'border-error bg-error-container text-on-error-container hover:brightness-105'
          : 'border-outline-variant bg-white text-on-surface hover:bg-surface-container-low',
      )}
    >
      <Icon name="favorite" size="sm" filled={vm.activo} className={vm.activo ? 'text-error' : ''} />
      {vm.activo ? 'En tus favoritos' : 'Guardar en favoritos'}
    </button>
  )
}
