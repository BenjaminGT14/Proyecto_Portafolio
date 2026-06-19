import { useCallback, useState } from 'react'
import {
  actualizarEvento,
  cambiarEstadoEvento,
  crearEvento,
  eliminarEvento,
  listarEventosAdmin,
  listarLugares,
} from '@/model/entretecaRepository'
import { useAsyncData } from '@/viewmodel/shared/useAsyncData'

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

function mapEventoToForm(evento) {
  return {
    nombre: evento.nombre ?? '',
    descripcion: evento.descripcion ?? '',
    id_lugar: evento.id_lugar ?? '',
    fecha_inicio: evento.fecha_inicio ? evento.fecha_inicio.slice(0, 16) : '',
    fecha_fin: evento.fecha_fin ? evento.fecha_fin.slice(0, 16) : '',
    es_gratuito: evento.es_gratuito ?? true,
    precio: evento.precio ?? '',
    imagen_url: evento.imagen_url ?? '',
  }
}

function buildPayload(form) {
  return {
    ...form,
    precio: form.precio !== '' ? parseFloat(form.precio) : null,
    es_gratuito: form.es_gratuito === true || form.es_gratuito === 'true',
    fecha_fin: form.fecha_fin || null,
    id_lugar: form.id_lugar || null,
  }
}

export function useAdminEventosViewModel() {
  const [refresh, setRefresh] = useState(0)
  const bump = useCallback(() => setRefresh((n) => n + 1), [])
  const cargarEventos = useCallback(() => listarEventosAdmin(), [])
  const cargarLugares = useCallback(() => listarLugares(), [])
  const { data: eventos, loading } = useAsyncData(cargarEventos, refresh)
  const { data: lugares } = useAsyncData(cargarLugares)
  const [modal, setModal] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [saving, setSaving] = useState(false)
  const [moderando, setModerando] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  function abrirCrear() {
    setForm(EMPTY_FORM)
    setModal({ modo: 'crear' })
  }

  function abrirEditar(evento) {
    setForm(mapEventoToForm(evento))
    setModal({ modo: 'editar', evento })
  }

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleGuardar(e) {
    e.preventDefault()
    setSaving(true)
    const payload = buildPayload(form)
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

  async function moderar(idEvento, estado) {
    setModerando(idEvento)
    await cambiarEstadoEvento({ idEvento, estado })
    setModerando(null)
    bump()
  }

  const registros = eventos ?? []

  return {
    eventos: registros,
    pendientes: registros.filter((e) => e.estado === 'pendiente'),
    lugares: lugares ?? [],
    loading,
    modal,
    setModal,
    confirmDelete,
    setConfirmDelete,
    saving,
    moderando,
    form,
    abrirCrear,
    abrirEditar,
    setField,
    handleGuardar,
    handleEliminar,
    aprobar: (id) => moderar(id, 'aprobado'),
    rechazar: (id) => moderar(id, 'rechazado'),
  }
}
