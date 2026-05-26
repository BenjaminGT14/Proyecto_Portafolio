import { cn } from '@/lib/utils'

/**
 * Icono Material Symbols Outlined.
 *
 * @param {Object} props
 * @param {string} props.name      nombre del símbolo (ej. "search", "favorite", "park")
 * @param {boolean} [props.filled] versión rellena (FILL=1)
 * @param {string} [props.size]    "sm" | "md" | "lg" | clase tailwind a medida
 */
export function Icon({ name, filled = false, size = 'md', className, style, ...rest }) {
  const sizeClass =
    size === 'sm'
      ? 'text-[18px]'
      : size === 'lg'
        ? 'text-[28px]'
        : size === 'md'
          ? 'text-[22px]'
          : size

  return (
    <span
      aria-hidden="true"
      className={cn('material-symbols-outlined', sizeClass, className)}
      style={
        filled ? { ...style, fontVariationSettings: '"FILL" 1' } : style
      }
      {...rest}
    >
      {name}
    </span>
  )
}
