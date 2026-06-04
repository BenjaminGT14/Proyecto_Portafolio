import { useCallback } from 'react'
import {
  actualizarEvento,
  crearEvento,
  eliminarEvento,
  listarEventos,
  listarLugares,
} from '@/model/entretecaRepository'
import { useAsyncData } from '@/viewmodel/shared/useAsyncData'
import { useAdminCrud } from './useAdminCrud'

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
  const crud = useAdminCrud({
    listar: listarEventos,
    crear: crearEvento,
    actualizar: actualizarEvento,
    eliminar: eliminarEvento,
    emptyForm: EMPTY_FORM,
    mapToForm: mapEventoToForm,
    buildPayload,
    idKey: 'id_evento',
    entidadLabel: 'el evento',
  })

  const cargarLugares = useCallback(() => listarLugares(), [])
  const { data: lugares } = useAsyncData(cargarLugares)

  return {
    ...crud,
    eventos: crud.items,
    lugares: lugares ?? [],
  }
}
