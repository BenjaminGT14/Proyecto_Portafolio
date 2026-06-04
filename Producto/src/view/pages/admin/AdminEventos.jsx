import { Icon } from '@/view/components/ui/Icon'
import { formatFecha } from '@/core/utils'
import { useAdminEventosViewModel } from '@/viewmodel/admin/useAdminEventosViewModel'
import { ErrorAlert, Modal, TableSkeleton } from './AdminLugares'

export function AdminEventosPage() {
  const vm = useAdminEventosViewModel()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Eventos</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {vm.eventos.length} registros
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

      {vm.loading ? (
        <TableSkeleton cols={5} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                {['Nombre', 'Lugar', 'Fecha inicio', 'Precio', 'Acciones'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-outline">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {vm.eventos.map((evento) => (
                <tr key={evento.id_evento} className="hover:bg-surface-container-low">
                  <td className="px-4 py-3 font-medium text-on-surface">{evento.nombre}</td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {evento.lugar?.nombre ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {formatFecha(evento.fecha_inicio)}
                  </td>
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
                    <div className="flex gap-2">
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
            <Field label="Nombre *">
              <input required aria-label="Nombre" value={vm.form.nombre} onChange={(e) => vm.setField('nombre', e.target.value)}
                className={INPUT_CLS} />
            </Field>
            <Field label="Descripción">
              <textarea aria-label="Descripción" value={vm.form.descripcion} onChange={(e) => vm.setField('descripcion', e.target.value)}
                rows={3} className={INPUT_CLS} />
            </Field>
            <Field label="Lugar">
              <select value={vm.form.id_lugar} onChange={(e) => vm.setField('id_lugar', e.target.value)}
                className={INPUT_CLS}>
                <option value="">Sin lugar asignado</option>
                {vm.lugares.map((l) => (
                  <option key={l.id_lugar} value={l.id_lugar}>{l.nombre}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Fecha inicio *">
                <input required type="datetime-local" aria-label="Fecha inicio" value={vm.form.fecha_inicio}
                  onChange={(e) => vm.setField('fecha_inicio', e.target.value)} className={INPUT_CLS} />
              </Field>
              <Field label="Fecha término">
                <input type="datetime-local" aria-label="Fecha término" value={vm.form.fecha_fin}
                  onChange={(e) => vm.setField('fecha_fin', e.target.value)} className={INPUT_CLS} />
              </Field>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={vm.form.es_gratuito}
                  onChange={(e) => vm.setField('es_gratuito', e.target.checked)}
                  className="size-4 accent-secondary" />
                Es gratuito
              </label>
              {!vm.form.es_gratuito && (
                <Field label="Precio (CLP)">
                  <input type="number" aria-label="Precio (CLP)" value={vm.form.precio}
                    onChange={(e) => vm.setField('precio', e.target.value)} className={INPUT_CLS} />
                </Field>
              )}
            </div>
            <Field label="URL de imagen">
              <input type="url" aria-label="URL de imagen" value={vm.form.imagen_url}
                onChange={(e) => vm.setField('imagen_url', e.target.value)} className={INPUT_CLS} />
            </Field>
            {vm.error && <ErrorAlert message={vm.error} />}
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
          {vm.error && <ErrorAlert message={vm.error} className="mt-4" />}
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

const INPUT_CLS =
  'w-full rounded-lg border border-outline-variant px-3 py-2 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary'

function Field({ label, children }) {
  // El control se anida dentro del <label> para que quede asociado a su texto
  // (un lector de pantalla anuncia la etiqueta al enfocar el campo).
  return (
    <label className="block space-y-1">
      <span className="block text-xs font-medium text-on-surface-variant">{label}</span>
      {children}
    </label>
  )
}
