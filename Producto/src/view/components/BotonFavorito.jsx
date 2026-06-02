import { Icon } from '@/view/components/ui/Icon'
import { useFavoritoViewModel } from '@/viewmodel/public/useFavoritoViewModel'
import { cn } from '@/core/utils'

/**
 * Botón corazón para favoritar un lugar o evento.
 * Si no hay sesión, redirige a /login al hacer click.
 *
 * Props mutuamente excluyentes: idLugar o idEvento.
 */
export function BotonFavorito({ idLugar, idEvento, size = 'sm', className }) {
  const vm = useFavoritoViewModel({ idLugar, idEvento })

  async function alternarFavorito(e) {
    e.preventDefault()
    e.stopPropagation()
    await vm.toggle()
  }

  return (
    <button
      type="button"
      onClick={alternarFavorito}
      disabled={vm.submitting}
      aria-label={vm.activo ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      className={cn(
        'inline-flex items-center justify-center transition-transform hover:scale-110',
        vm.activo ? 'text-error' : 'text-outline hover:text-error',
        className,
      )}
    >
      <Icon name="favorite" size={size} filled={vm.activo} />
    </button>
  )
}
