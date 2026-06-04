import { useCallback, useState } from 'react'
import { useAsyncData } from '@/viewmodel/shared/useAsyncData'

/**
 * Lógica compartida del CRUD de administración (lugares, eventos, …): listado
 * con refresco, modal crear/editar, confirmación de borrado, estado de guardado
 * y manejo de errores. Cada panel solo aporta sus funciones del repositorio y el
 * mapeo de su formulario.
 *
 * @param listar/crear/actualizar/eliminar  funciones del repositorio
 * @param emptyForm     estado inicial del formulario
 * @param mapToForm     entidad -> valores del formulario (al editar)
 * @param buildPayload  formulario -> payload para el repositorio
 * @param idKey         nombre del campo id ('id_lugar' | 'id_evento')
 * @param entidadLabel  texto para los mensajes de error ('el lugar' | 'el evento')
 */
export function useAdminCrud({
  listar,
  crear,
  actualizar,
  eliminar,
  emptyForm,
  mapToForm,
  buildPayload,
  idKey,
  entidadLabel = 'el registro',
}) {
  const [refresh, setRefresh] = useState(0)
  const bump = useCallback(() => setRefresh((n) => n + 1), [])
  const cargar = useCallback(() => listar(), [listar])
  const { data, loading } = useAsyncData(cargar, refresh)

  const [modal, setModal] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(emptyForm)

  function abrirCrear() {
    setForm(emptyForm)
    setError(null)
    setModal({ modo: 'crear' })
  }

  function abrirEditar(entidad) {
    setForm(mapToForm(entidad))
    setError(null)
    setModal({ modo: 'editar', entidad })
  }

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleGuardar(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload = buildPayload(form)
    const { error: err } =
      modal.modo === 'crear'
        ? await crear(payload)
        : await actualizar(modal.entidad[idKey], payload)
    setSaving(false)
    if (err) {
      setError(err.message ?? `No se pudo guardar ${entidadLabel}`)
      return
    }
    setModal(null)
    bump()
  }

  async function handleEliminar() {
    if (!confirmDelete) return
    setError(null)
    const { error: err } = await eliminar(confirmDelete[idKey])
    if (err) {
      setError(err.message ?? `No se pudo eliminar ${entidadLabel}`)
      return
    }
    setConfirmDelete(null)
    bump()
  }

  return {
    items: data ?? [],
    loading,
    modal,
    setModal,
    confirmDelete,
    setConfirmDelete,
    saving,
    error,
    form,
    abrirCrear,
    abrirEditar,
    setField,
    handleGuardar,
    handleEliminar,
  }
}
