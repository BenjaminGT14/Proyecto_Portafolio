import { useCallback, useState } from 'react'
import {
  actualizarLugar,
  crearLugar,
  eliminarLugar,
  listarCategorias,
  listarLugares,
} from '@/model/entretecaRepository'
import { comunasSantiago } from '@/model/mockData'
import { useAsyncData } from '@/viewmodel/shared/useAsyncData'

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

function mapLugarToForm(lugar) {
  return {
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
  }
}

function buildPayload(form) {
  return {
    ...form,
    latitud: form.latitud !== '' ? parseFloat(form.latitud) : null,
    longitud: form.longitud !== '' ? parseFloat(form.longitud) : null,
    precio: form.precio !== '' ? parseFloat(form.precio) : null,
    es_gratuito: form.es_gratuito === true || form.es_gratuito === 'true',
  }
}

export function useAdminLugaresViewModel() {
  const [refresh, setRefresh] = useState(0)
  const bump = useCallback(() => setRefresh((n) => n + 1), [])
  const cargarLugares = useCallback(() => listarLugares(), [])
  const cargarCategorias = useCallback(() => listarCategorias(), [])
  const { data: lugares, loading } = useAsyncData(cargarLugares, refresh)
  const { data: categorias } = useAsyncData(cargarCategorias)
  const [modal, setModal] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  function abrirCrear() {
    setForm(EMPTY_FORM)
    setModal({ modo: 'crear' })
  }

  function abrirEditar(lugar) {
    setForm(mapLugarToForm(lugar))
    setModal({ modo: 'editar', lugar })
  }

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleGuardar(e) {
    e.preventDefault()
    setSaving(true)
    const payload = buildPayload(form)
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

  return {
    lugares: lugares ?? [],
    categorias: categorias ?? [],
    comunas: comunasSantiago,
    loading,
    modal,
    setModal,
    confirmDelete,
    setConfirmDelete,
    saving,
    form,
    abrirCrear,
    abrirEditar,
    setField,
    handleGuardar,
    handleEliminar,
  }
}
