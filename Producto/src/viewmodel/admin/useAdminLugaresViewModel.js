import { useCallback } from 'react'
import {
  actualizarLugar,
  crearLugar,
  eliminarLugar,
  listarCategorias,
  listarLugares,
} from '@/model/entretecaRepository'
import { comunasSantiago } from '@/model/comunas'
import { useAsyncData } from '@/viewmodel/shared/useAsyncData'
import { useAdminCrud } from './useAdminCrud'

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
  const crud = useAdminCrud({
    listar: listarLugares,
    crear: crearLugar,
    actualizar: actualizarLugar,
    eliminar: eliminarLugar,
    emptyForm: EMPTY_FORM,
    mapToForm: mapLugarToForm,
    buildPayload,
    idKey: 'id_lugar',
    entidadLabel: 'el lugar',
  })

  const cargarCategorias = useCallback(() => listarCategorias(), [])
  const { data: categorias } = useAsyncData(cargarCategorias)

  return {
    ...crud,
    lugares: crud.items,
    categorias: categorias ?? [],
    comunas: comunasSantiago,
  }
}
