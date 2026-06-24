import { Icon } from '@/view/components/ui/Icon'
import { ErrorBanner } from '@/view/components/ui/ErrorBanner'
import { formatFecha } from '@/core/utils'
import { useAdminEventosViewModel } from '@/viewmodel/admin/useAdminEventosViewModel'
import { EventoFormFields } from '@/view/components/EventoFormFields'
import { Modal, TableSkeleton } from './AdminLugares'

const ESTADO_CLS = {
  aprobado: 'bg-secondary-fixed text-on-secondary-fixed-variant',
  pendiente: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  rechazado: 'bg-error-container text-error',
}

function EstadoEventoBadge({ estado }) {
  return (
    <span className={`rounded px-2 py-0.5 text-[11px] font-semibold capitalize ${ESTADO_CLS[estado] ?? ESTADO_CLS.pendiente}`}>
      {estado}
    </span>
  )
}

export function AdminEventosPage() {
  const vm = useAdminEventosViewModel()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Eventos</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {vm.eventos.length} registros
            {vm.pendientes.length > 0 && ` · ${vm.pendientes.length} propuesta(s) pendiente(s)`}
          </p>
        </div>
        <button
          type="button"
          onClick={vm.abrirCrear}
          className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
        >
          <Icon name="add" size="sm" />
          Nuevo evento
        </button>
      </div>

      <ErrorBanner mensaje={vm.error} />

      {/* Propuestas pendientes de la comunidad */}
      {vm.pendientes.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-tertiary/40 bg-tertiary-fixed/30 p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-on-tertiary-fixed-variant">
            <Icon name="inbox" size="sm" />
            Propuestas pendientes de aprobación
          </h2>
          <div className="space-y-2">
            {vm.pendientes.map((e) => (
              <div
                key={e.id_evento}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline-variant bg-white p-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-on-surface">{e.nombre}</p>
                  <p className="text-xs text-on-surface-variant">
                    Propuesto por {e.propuesto_por?.nombre ?? 'usuario'} ·{' '}
                    {e.lugar?.nombre ?? 'sin lugar'} · {formatFecha(e.fecha_inicio)}
                  </p>
                  {e.descripcion && (
                    <p className="mt-1 line-clamp-2 max-w-xl text-xs text-outline">{e.descripcion}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={vm.moderando === e.id_evento}
                    onClick={() => vm.aprobar(e.id_evento)}
                    className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-60"
                  >
                    <Icon name="check" size="sm" /> Aprobar
                  </button>
                  <button
                    type="button"
                    disabled={vm.moderando === e.id_evento}
                    onClick={() => vm.rechazar(e.id_evento)}
                    className="flex items-center gap-1 rounded-lg border border-error/30 bg-error-container/20 px-3 py-1.5 text-xs font-semibold text-error hover:bg-error-container/50 disabled:opacity-60"
                  >
                    <Icon name="close" size="sm" /> Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {vm.loading ? (
        <TableSkeleton cols={6} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                {['Nombre', 'Lugar', 'Fecha inicio', 'Estado', 'Precio', 'Acciones'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-outline">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {vm.eventos.map((evento) => (
                <tr key={evento.id_evento} className="hover:bg-surface-container-low">
                  <td className="px-4 py-3 font-medium text-on-surface">
                    {evento.nombre}
                    {evento.propuesto_por && (
                      <span className="block text-[11px] font-normal text-outline">
                        Propuesto por {evento.propuesto_por.nombre}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{evento.lugar?.nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{formatFecha(evento.fecha_inicio)}</td>
                  <td className="px-4 py-3"><EstadoEventoBadge estado={evento.estado} /></td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                        evento.es_gratuito
                          ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                          : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                      }`}
                    >
                      {evento.es_gratuito ? 'Gratis' : `$${evento.precio?.toLocaleString('es-CL')}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {evento.estado === 'pendiente' && (
                        <>
                          <button
                            type="button"
                            disabled={vm.moderando === evento.id_evento}
                            onClick={() => vm.aprobar(evento.id_evento)}
                            className="flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-60"
                          >
                            <Icon name="check" size="sm" /> Aprobar
                          </button>
                          <button
                            type="button"
                            disabled={vm.moderando === evento.id_evento}
                            onClick={() => vm.rechazar(evento.id_evento)}
                            className="flex items-center gap-1 rounded-lg border border-error/30 bg-error-container/20 px-2.5 py-1.5 text-xs font-medium text-error hover:bg-error-container/50 disabled:opacity-60"
                          >
                            <Icon name="close" size="sm" /> Rechazar
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => vm.abrirEditar(evento)}
                        className="flex items-center gap-1 rounded-lg border border-outline-variant px-2.5 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                      >
                        <Icon name="edit" size="sm" /> Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => vm.setConfirmDelete(evento)}
                        className="flex items-center gap-1 rounded-lg border border-error/30 bg-error-container/20 px-2.5 py-1.5 text-xs font-medium text-error hover:bg-error-container/50"
                      >
                        <Icon name="delete" size="sm" /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {vm.eventos.length === 0 && (
            <p className="py-12 text-center text-sm text-outline">Sin registros.</p>
          )}
        </div>
      )}

      {vm.modal && (
        <Modal title={vm.modal.modo === 'crear' ? 'Nuevo evento' : 'Editar evento'} onClose={() => vm.setModal(null)}>
          <form onSubmit={vm.handleGuardar} className="space-y-4">
            <EventoFormFields form={vm.form} setField={vm.setField} lugares={vm.lugares} />
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => vm.setModal(null)}
                className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container-high">
                Cancelar
              </button>
              <button type="submit" disabled={vm.saving}
                className="rounded-xl bg-secondary px-6 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
                {vm.saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {vm.confirmDelete && (
        <Modal title="Eliminar evento" onClose={() => vm.setConfirmDelete(null)}>
          <p className="text-sm text-on-surface-variant">
            ¿Seguro que deseas eliminar <strong>{vm.confirmDelete.nombre}</strong>?
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => vm.setConfirmDelete(null)}
              className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container-high">
              Cancelar
            </button>
            <button type="button" onClick={vm.handleEliminar}
              className="rounded-xl bg-error px-6 py-2 text-sm font-semibold text-white hover:brightness-110">
              Eliminar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
