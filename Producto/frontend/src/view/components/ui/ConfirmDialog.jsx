import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/view/components/ui/Button'

/**
 * Diálogo de confirmación accesible y reutilizable (rol dialog + aria-modal).
 * - Cierra con Esc o clic en el backdrop (equivale a Cancelar).
 * - Atrapa el foco inicial en el botón Cancelar (opción segura por defecto).
 * - Bloquea el scroll del body mientras está abierto.
 * - Responsive: ancho máximo y padding adaptativos.
 * - Se renderiza vía portal en document.body para no quedar atrapado por un
 *   ancestro con transform/filter (p. ej. el navbar con backdrop-blur, que crea
 *   un containing block y descentraría el overlay `fixed`).
 *
 * No renderiza nada si `open` es false.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmVariant = 'destructive',
  loading = false,
  onConfirm,
  onCancel,
}) {
  const titleId = useId()
  const descId = useId()

  // Esc para cancelar + bloqueo de scroll del body mientras está abierto.
  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onCancel?.()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label={cancelLabel}
        tabIndex={-1}
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-[1px]"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 id={titleId} className="text-lg font-bold text-on-surface">
          {title}
        </h2>
        <p id={descId} className="mt-2 text-sm text-on-surface-variant">
          {message}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            autoFocus
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="sm:min-w-24"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={loading}
            className="sm:min-w-24"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
