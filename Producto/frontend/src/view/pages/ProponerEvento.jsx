import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Icon } from '@/view/components/ui/Icon'
import { EventoFormFields } from '@/view/components/EventoFormFields'
import { useProponerEventoViewModel } from '@/viewmodel/public/useProponerEventoViewModel'

export function ProponerEventoPage() {
  const vm = useProponerEventoViewModel()

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <Link to="/eventos" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-secondary">
        <ArrowLeft className="size-4" />
        Volver a eventos
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Proponer un evento</h1>
        <p className="mt-1 text-sm text-slate-600">
          Comparte un panorama con la comunidad. Un administrador revisará tu propuesta antes de publicarla.
        </p>
      </header>

      {vm.done ? (
        <div className="space-y-4 rounded-2xl border border-secondary/30 bg-secondary-fixed/30 p-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary/15">
            <Icon name="check_circle" size="lg" className="text-secondary" />
          </div>
          <div>
            <p className="text-lg font-bold text-on-surface">¡Propuesta enviada!</p>
            <p className="mt-1 text-sm text-on-surface-variant">
              Tu evento quedó <strong>pendiente de aprobación</strong>. Cuando un administrador lo
              apruebe, aparecerá en la lista de eventos.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={vm.reset}
              className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container-high"
            >
              Proponer otro
            </button>
            <Link
              to="/eventos"
              className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
            >
              Ver eventos
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={vm.handleSubmit}
          className="space-y-4 rounded-2xl border border-outline-variant bg-white p-6 shadow-sm"
        >
          <EventoFormFields form={vm.form} setField={vm.setField} lugares={vm.lugares} />

          {vm.error && (
            <div className="rounded-lg border border-error-container bg-error-container px-3 py-2 text-sm text-on-error-container">
              {vm.error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Link
              to="/eventos"
              className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container-high"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={vm.saving}
              className="rounded-xl bg-secondary px-6 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
            >
              {vm.saving ? 'Enviando…' : 'Enviar propuesta'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
