import { useState, useCallback } from 'react'
import { Icon } from '@/components/ui/Icon'
import { listarEventos, listarLugares, crearEvento, actualizarEvento, eliminarEvento } from '@/lib/api'
import { useAsyncData } from '@/hooks/useAsyncData'
import { formatFecha } from '@/lib/utils'
import { Modal, TableSkeleton } from './AdminLugares'

const EMPTY_FORM = {
  nombre: '',
  descripcion: '',
  id_lugar: '',
  fecha_inicio: '',
  fecha_fin: '',
  es_gratuito: true,
  precio: '',
  imagen_url: '',
}

export function AdminEventosPage() {
  const [refresh, setRefresh] = useState(0)
  const bump = useCallback(() => setRefresh((n) => n + 1), [])

  const { data: eventos, loading } = useAsyncData(() => listarEventos(), [refresh])
  const { data: lugares } = useAsyncData(() => listarLugares(), [])

  const [modal, setModal] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  function abrirCrear() {
    setForm(EMPTY_FORM)
    setModal({ modo: 'crear' })
  }

  function abrirEditar(evento) {
    setForm({
      nombre: evento.nombre ?? '',
      descripcion: evento.descripcion ?? '',
      id_lugar: evento.id_lugar ?? '',
      fecha_inicio: evento.fecha_inicio ? evento.fecha_inicio.slice(0, 16) : '',
      fecha_fin: evento.fecha_fin ? evento.fecha_fin.slice(0, 16) : '',
      es_gratuito: evento.es_gratuito ?? true,
      precio: evento.precio ?? '',
      imagen_url: evento.imagen_url ?? '',
    })
    setModal({ modo: 'editar', evento })
  }

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleGuardar(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      precio: form.precio !== '' ? parseFloat(form.precio) : null,
      es_gratuito: form.es_gratuito === true || form.es_gratuito === 'true',
      fecha_fin: form.fecha_fin || null,
      id_lugar: form.id_lugar || null,
    }
    if (modal.modo === 'crear') {
      await crearEvento(payload)
    } else {
      await actualizarEvento(modal.evento.id_evento, payload)
    }
    setSaving(false)
    setModal(null)
    bump()
  }

  async function handleEliminar() {
    if (!confirmDelete) return
    await eliminarEvento(confirmDelete.id_evento)
    setConfirmDelete(null)
    bump()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Eventos</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {(eventos ?? []).length} registros
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
        >
          <Icon name="add" size="sm" />
          Nuevo evento
        </button>
      </div>

      {loading ? (
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
              {(eventos ?? []).map((evento) => (
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
                        onClick={() => abrirEditar(evento)}
                        className="flex items-center gap-1 rounded-lg border border-outline-variant px-2.5 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                      >
                        <Icon name="edit" size="sm" /> Editar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(evento)}
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
          {(eventos ?? []).length === 0 && (
            <p className="py-12 text-center text-sm text-outline">Sin registros.</p>
          )}
        </div>
      )}

      {modal && (
        <Modal title={modal.modo === 'crear' ? 'Nuevo evento' : 'Editar evento'} onClose={() => setModal(null)}>
          <form onSubmit={handleGuardar} className="space-y-4">
            <Field label="Nombre *">
              <input required value={form.nombre} onChange={(e) => setField('nombre', e.target.value)}
                className={INPUT_CLS} />
            </Field>
            <Field label="Descripción">
              <textarea value={form.descripcion} onChange={(e) => setField('descripcion', e.target.value)}
                rows={3} className={INPUT_CLS} />
            </Field>
            <Field label="Lugar">
              <select value={form.id_lugar} onChange={(e) => setField('id_lugar', e.target.value)}
                className={INPUT_CLS}>
                <option value="">— Sin lugar asignado —</option>
                {(lugares ?? []).map((l) => (
                  <option key={l.id_lugar} value={l.id_lugar}>{l.nombre}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Fecha inicio *">
                <input required type="datetime-local" value={form.fecha_inicio}
                  onChange={(e) => setField('fecha_inicio', e.target.value)} className={INPUT_CLS} />
              </Field>
              <Field label="Fecha término">
                <input type="datetime-local" value={form.fecha_fin}
                  onChange={(e) => setField('fecha_fin', e.target.value)} className={INPUT_CLS} />
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

      {confirmDelete && (
        <Modal title="Eliminar evento" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-on-surface-variant">
            ¿Seguro que deseas eliminar <strong>{confirmDelete.nombre}</strong>?
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
