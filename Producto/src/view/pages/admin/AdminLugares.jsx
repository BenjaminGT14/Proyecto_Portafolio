import { Icon } from '@/view/components/ui/Icon'
import { cn } from '@/core/utils'
import { useAdminLugaresViewModel } from '@/viewmodel/admin/useAdminLugaresViewModel'

export function AdminLugaresPage() {
  const vm = useAdminLugaresViewModel()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Lugares</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {vm.lugares.length} registros
          </p>
        </div>
        <button
          type="button"
          onClick={vm.abrirCrear}
          className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
        >
          <Icon name="add" size="sm" />
          Nuevo lugar
        </button>
      </div>

      {vm.loading ? (
        <TableSkeleton cols={5} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                {['Nombre', 'Categoría', 'Comuna', 'Precio', 'Acciones'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-outline">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {vm.lugares.map((lugar) => (
                <tr key={lugar.id_lugar} className="hover:bg-surface-container-low">
                  <td className="px-4 py-3 font-medium text-on-surface">{lugar.nombre}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{lugar.categoria?.nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{lugar.comuna}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                        lugar.es_gratuito
                          ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                          : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                      }`}
                    >
                      {lugar.es_gratuito ? 'Gratis' : 'Pagado'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => vm.abrirEditar(lugar)}
                        className="flex items-center gap-1 rounded-lg border border-outline-variant px-2.5 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                      >
                        <Icon name="edit" size="sm" /> Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => vm.setConfirmDelete(lugar)}
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
          {vm.lugares.length === 0 && (
            <p className="py-12 text-center text-sm text-outline">Sin registros.</p>
          )}
        </div>
      )}

      {/* Modal crear/editar */}
      {vm.modal && (
        <Modal title={vm.modal.modo === 'crear' ? 'Nuevo lugar' : 'Editar lugar'} onClose={() => vm.setModal(null)}>
          <form onSubmit={vm.handleGuardar} className="space-y-4">
            <Field label="Nombre *">
              <input required aria-label="Nombre" value={vm.form.nombre} onChange={(e) => vm.setField('nombre', e.target.value)}
                className={INPUT_CLS} />
            </Field>
            <Field label="Descripción">
              <textarea aria-label="Descripción" value={vm.form.descripcion} onChange={(e) => vm.setField('descripcion', e.target.value)}
                rows={3} className={INPUT_CLS} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Categoría *">
                <select required value={vm.form.id_categoria} onChange={(e) => vm.setField('id_categoria', e.target.value)}
                  className={INPUT_CLS}>
                  <option value="">Seleccionar categoría</option>
                  {vm.categorias.map((c) => (
                    <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                  ))}
                </select>
              </Field>
              <Field label="Comuna *">
                <select required value={vm.form.comuna} onChange={(e) => vm.setField('comuna', e.target.value)}
                  className={INPUT_CLS}>
                  {vm.comunas.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Dirección">
              <input aria-label="Dirección" value={vm.form.direccion} onChange={(e) => vm.setField('direccion', e.target.value)}
                className={INPUT_CLS} />
            </Field>
            <Field label="Horario">
              <input aria-label="Horario" value={vm.form.horario} onChange={(e) => vm.setField('horario', e.target.value)}
                placeholder="Ej: Lun a Dom 09:00 - 18:00" className={INPUT_CLS} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitud">
                <input type="number" step="any" aria-label="Latitud" value={vm.form.latitud}
                  onChange={(e) => vm.setField('latitud', e.target.value)} className={INPUT_CLS} />
              </Field>
              <Field label="Longitud">
                <input type="number" step="any" aria-label="Longitud" value={vm.form.longitud}
                  onChange={(e) => vm.setField('longitud', e.target.value)} className={INPUT_CLS} />
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

      {/* Confirm delete */}
      {vm.confirmDelete && (
        <Modal title="Eliminar lugar" onClose={() => vm.setConfirmDelete(null)}>
          <p className="text-sm text-on-surface-variant">
            ¿Seguro que deseas eliminar <strong>{vm.confirmDelete.nombre}</strong>? Esta acción no se puede deshacer.
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

// ---- Shared helpers --------------------------------------------------------

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

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <h2 className="text-base font-semibold text-on-surface">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-surface-container-high">
            <Icon name="close" size="sm" className="text-outline" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function ErrorAlert({ message, className }) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border border-error-container bg-error-container px-3 py-2 text-sm text-on-error-container',
        className,
      )}
    >
      {message}
    </div>
  )
}

export function TableSkeleton({ cols = 4, rows = 5 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm">
      <div className="space-y-px">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-4 flex-1 animate-pulse rounded bg-surface-container-high" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
