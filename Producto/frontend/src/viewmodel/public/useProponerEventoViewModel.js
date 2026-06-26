import { useCallback, useState } from 'react'
import { listarLugares, proponerEvento } from '@/model/eventoutRepository'
import { useAsyncData } from '@/viewmodel/shared/useAsyncData'
import { validarFechasEvento } from '@/viewmodel/shared/validations'

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

// Mismo payload que usa el alta de admin (snake_case para el backend).
function buildPayload(form) {
  return {
    ...form,
    precio: form.precio !== '' ? parseFloat(form.precio) : null,
    es_gratuito: form.es_gratuito === true || form.es_gratuito === 'true',
    fecha_fin: form.fecha_fin || null,
    id_lugar: form.id_lugar || null,
  }
}

export function useProponerEventoViewModel() {
  const cargarLugares = useCallback(() => listarLugares(), [])
  const { data: lugares } = useAsyncData(cargarLugares)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!form.nombre.trim()) {
      setError('El nombre del evento es obligatorio.')
      return
    }
    const errorFechas = validarFechasEvento(form)
    if (errorFechas) {
      setError(errorFechas)
      return
    }
    setSaving(true)
    const res = await proponerEvento(buildPayload(form))
    setSaving(false)
    if (res.error) {
      setError(res.error.message ?? 'No pudimos enviar tu propuesta.')
      return
    }
    setDone(true)
  }

  function reset() {
    setForm(EMPTY_FORM)
    setDone(false)
    setError(null)
  }

  return { lugares: lugares ?? [], form, setField, saving, error, done, handleSubmit, reset }
}
