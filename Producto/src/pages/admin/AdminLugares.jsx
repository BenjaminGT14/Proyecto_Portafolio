import { useState, useCallback } from 'react'
import { Icon } from '@/components/ui/Icon'
import { listarLugares, listarCategorias, crearLugar, actualizarLugar, eliminarLugar } from '@/lib/api'
import { useAsyncData } from '@/hooks/useAsyncData'
import { comunasSantiago } from '@/lib/mockData'

const EMPTY_FORM = {
  nombre: '',
  descripcion: '',
  direccion: '',
  comuna: 'Santiago',
  id_categoria: '',
  es_gratuito: true,
  precio: '',
  horario: '',
  latitud: '',
  longitud: '',
  imagen_url: '',
}

export function AdminLugaresPage() {
  const [refresh, setRefresh] = useState(0)
  const bump = useCallback(() => setRefresh((n) => n + 1), [])

  const { data: lugares, loading } = useAsyncData(() => listarLugares(), [refresh])
  const { data: categorias } = useAsyncData(() => listarCategorias(), [])

  const [modal, setModal] = useState(null) // null | { modo: 'crear'|'editar', lugar? }
  const [confirmDelete, setConfirmDelete] = useState(null) // lugar o null
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  function abrirCrear() {
    setForm(EMPTY_FORM)
    setModal({ modo: 'crear' })
  }

  function abrirEditar(lugar) {
    setForm({
      nombre: lugar.nombre ?? '',
      descripcion: lugar.descripcion ?? '',
      direccion: lugar.direccion ?? '',
      comuna: lugar.comuna ?? 'Santiago',
      id_categoria: lugar.id_categoria ?? '',
      es_gratuito: lugar.es_gratuito ?? true,
      precio: lugar.precio ?? '',
      horario: lugar.horario ?? '',
      latitud: lugar.latitud ?? '',
      longitud: lugar.longitud ?? '',
      imagen_url: lugar.imagen_url ?? '',
    })
    setModal({ modo: 'editar', lugar })
  }

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleGuardar(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      latitud: form.latitud !== '' ? parseFloat(form.latitud) : null,
      longitud: form.longitud !== '' ? parseFloat(form.longitud) : null,
      precio: form.precio !== '' ? parseFloat(form.precio) : null,
      es_gratuito: form.es_gratuito === true || form.es_gratuito === 'true',
    }
    if (modal.modo === 'crear') {
      await crearLugar(payload)
    } else {
      await actualizarLugar(modal.lugar.id_lugar, payload)
    }
    setSaving(false)
    setModal(null)
    bump()
  }

  async function handleEliminar() {
    if (!confirmDelete) return
    await eliminarLugar(confirmDelete.id_lugar)
    setConfirmDelete(null)
    bump()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Lugares</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {(lugares ?? []).length} registros
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
        >
          <Icon name="add" size="sm" />
          Nuevo lugar
        </button>
      </div>

      {loading ? (
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
              {(lugares ?? []).map((lugar) => (
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
                        onClick={() => abrirEditar(lugar)}
                        className="flex items-center gap-1 rounded-lg border border-outline-variant px-2.5 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                      >
                        <Icon name="edit" size="sm" /> Editar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(lugar)}
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
          {(lugares ?? []).length === 0 && (
            <p className="py-12 text-center text-sm text-outline">Sin registros.</p>
          )}
        </div>
      )}

      {/* Modal crear/editar */}
      {modal && (
        <Modal title={modal.modo === 'crear' ? 'Nuevo lugar' : 'Editar lugar'} onClose={() => setModal(null)}>
          <form onSubmit={handleGuardar} className="space-y-4">
            <Field label="Nombre *">
              <input required value={form.nombre} onChange={(e) => setField('nombre', e.target.value)}
                className={INPUT_CLS} />
            </Field>
            <Field label="Descripción">
              <textarea value={form.descripcion} onChange={(e) => setField('descripcion', e.target.value)}
                rows={3} className={INPUT_CLS} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Categoría *">
                <select required value={form.id_categoria} onChange={(e) => setField('id_categoria', e.target.value)}
                  className={INPUT_CLS}>
                  <option value="">— Seleccionar —</option>
                  {(categorias ?? []).map((c) => (
                    <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                  ))}
                </select>
              </Field>
              <Field label="Comuna *">
                <select required value={form.comuna} onChange={(e) => setField('comuna', e.target.value)}
                  className={INPUT_CLS}>
                  {comunasSantiago.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Dirección">
              <input value={form.direccion} onChange={(e) => setField('direccion', e.target.value)}
                className={INPUT_CLS} />
            </Field>
            <Field label="Horario">
              <input value={form.horario} onChange={(e) => setField('horario', e.target.value)}
                placeholder="Ej: Lun a Dom 09:00 - 18:00" className={INPUT_CLS} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitud">
                <input type="number" step="any" value={form.latitud}
                  onChange={(e) => setField('latitud', e.target.value)} className={INPUT_CLS} />
              </Field>
              <Field label="Longitud">
                <input type="number" step="any" value={form.longitud}
                  onChange={(e) => setField('longitud', e.target.value)} className={INPUT_CLS} />
              </Field>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={form.es_gratuito}
                  onChange={(e) => setField('es_gratuito', e.target.checked)}
                  className="h-4 w-4 accent-secondary" />
                Es gratuito
              </label>
              {!form.es_gratuito && (
                <Field label="Precio (CLP)">
                  <input type="number" value={form.precio}
                    onChange={(e) => setField('precio', e.target.value)} className={INPUT_CLS} />
                </Field>
              )}
            </div>
            <Field label="URL de imagen">
              <input type="url" value={form.imagen_url}
                onChange={(e) => setField('imagen_url', e.target.value)} className={INPUT_CLS} />
            </Field>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)}
                className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container-high">
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                className="rounded-xl bg-secondary px-6 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <Modal title="Eliminar lugar" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-on-surface-variant">
            ¿Seguro que deseas eliminar <strong>{confirmDelete.nombre}</strong>? Esta acción no se puede deshacer.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)}
              className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container-high">
              Cancelar
            </button>
            <button onClick={handleEliminar}
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
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-on-surface-variant">{label}</label>
      {children}
    </div>
  )
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <h2 className="text-base font-semibold text-on-surface">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-surface-container-high">
            <Icon name="close" size="sm" className="text-outline" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
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
