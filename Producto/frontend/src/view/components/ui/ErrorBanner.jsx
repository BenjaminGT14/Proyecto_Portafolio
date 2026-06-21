import { Icon } from '@/view/components/ui/Icon'

// Banner discreto para mostrar errores de operaciones (guardar, eliminar, moderar).
// Si no hay mensaje, no renderiza nada.
export function ErrorBanner({ mensaje }) {
  if (!mensaje) return null
  return (
    <div
      role="alert"
      className="flex items-center gap-2 rounded-xl border border-error/30 bg-error-container/20 px-4 py-3 text-sm font-medium text-error"
    >
      <Icon name="error" size="sm" />
      <span>{mensaje}</span>
    </div>
  )
}
