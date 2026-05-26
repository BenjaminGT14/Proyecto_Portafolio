import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'

/**
 * Muestra 5 estrellas, opcionalmente interactivo para selección.
 *
 * @param {number} value       valor actual (0-5)
 * @param {Function} [onChange] si se entrega, vuelve interactivo
 * @param {string} [size]      "sm" | "md" | "lg"
 */
export function Estrellas({ value = 0, onChange, size = 'sm' }) {
  const interactive = typeof onChange === 'function'

  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => {
        const indice = i + 1
        const filled = indice <= value
        const base = (
          <Icon
            name="star"
            size={size}
            filled={filled}
            className={filled ? 'text-on-tertiary-container' : 'text-outline-variant'}
          />
        )
        if (!interactive) return <span key={i}>{base}</span>
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(indice)}
            className={cn(
              'rounded transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary',
            )}
            aria-label={`${indice} de 5 estrellas`}
          >
            {base}
          </button>
        )
      })}
    </div>
  )
}
