// Capa de acceso a datos. Habla con el backend Spring Boot vía REST (api.js).
// Cada función mantiene una firma estable y el contrato { data, error } que
// esperan los viewmodels.
import { apiFetch, buildQuery } from '@/core/api'

// ---- categorías -------------------------------------
export async function listarCategorias() {
  return apiFetch('/categorias')
}

// ---- lugares ----------------------------------------
export async function listarLugares({ idCategoria, comuna, costo, q } = {}) {
  return apiFetch(`/lugares${buildQuery({ idCategoria, comuna, costo, q })}`)
}

export async function obtenerLugar(id) {
  return apiFetch(`/lugares/${encodeURIComponent(id)}`)
}

// ---- eventos ----------------------------------------
export async function listarEventos({ comuna, costo, q, desde } = {}) {
  return apiFetch(`/eventos${buildQuery({ comuna, costo, q, desde })}`)
}

export async function obtenerEvento(id) {
  return apiFetch(`/eventos/${encodeURIComponent(id)}`)
}

// Propuesta de evento por un usuario (queda pendiente de aprobación admin).
export async function proponerEvento(input) {
  return apiFetch('/eventos/propuestas', { method: 'POST', body: input })
}

// ---- reseñas ----------------------------------------
export async function listarResenas({ idLugar, idEvento } = {}) {
  if (!idLugar && !idEvento) {
    return { data: [], error: new Error('idLugar o idEvento requerido') }
  }
  return apiFetch(`/resenas${buildQuery({ idLugar, idEvento })}`)
}

// Reseñas destacadas (más votadas) de toda la plataforma, para el feed del Home.
export async function listarResenasDestacadas({ limit = 6 } = {}) {
  return apiFetch(`/resenas/destacadas${buildQuery({ limit })}`)
}

export async function publicarResena({
  idUsuario,
  idLugar = null,
  idEvento = null,
  titulo,
  contenido,
  puntuacion,
}) {
  if (!idUsuario) return { data: null, error: new Error('Debes iniciar sesión') }
  if ((idLugar && idEvento) || (!idLugar && !idEvento)) {
    return { data: null, error: new Error('La reseña debe apuntar a un lugar o evento') }
  }
  // El backend toma el autor del JWT; el body va en snake_case (Jackson SNAKE_CASE).
  return apiFetch('/resenas', {
    method: 'POST',
    body: { id_lugar: idLugar, id_evento: idEvento, titulo, contenido, puntuacion },
  })
}

export async function votarResena({ idUsuario, idResena, esPositivo }) {
  if (!idUsuario) return { data: null, error: new Error('Debes iniciar sesión') }
  return apiFetch('/votos', {
    method: 'POST',
    body: { id_resena: idResena, es_positivo: esPositivo },
  })
}

export async function obtenerVotosUsuario({ idUsuario, idsResenas }) {
  if (!idUsuario || !idsResenas?.length) return { data: [], error: null }
  return apiFetch(`/votos${buildQuery({ idsResenas })}`)
}

// ---- favoritos --------------------------------------
export async function listarFavoritos({ idUsuario }) {
  if (!idUsuario) return { data: { lugares: [], eventos: [] }, error: null }
  return apiFetch('/favoritos')
}

export async function obtenerEstadoFavoritos({ idUsuario, idLugares = [], idEventos = [] }) {
  if (!idUsuario) return { data: { lugares: new Set(), eventos: new Set() }, error: null }

  const { data, error } = await apiFetch(`/favoritos/estado${buildQuery({ idLugares, idEventos })}`)
  if (error) return { data: { lugares: new Set(), eventos: new Set() }, error }
  // El viewmodel consume Sets (data.lugares.has(id)).
  return {
    data: {
      lugares: new Set(data?.lugares ?? []),
      eventos: new Set(data?.eventos ?? []),
    },
    error: null,
  }
}

export async function toggleFavorito({ idUsuario, idLugar = null, idEvento = null }) {
  if (!idUsuario) return { data: null, error: new Error('Debes iniciar sesión') }
  if ((idLugar && idEvento) || (!idLugar && !idEvento)) {
    return { data: null, error: new Error('Debe ser un lugar o un evento') }
  }
  return apiFetch('/favoritos/toggle', {
    method: 'POST',
    body: { id_lugar: idLugar, id_evento: idEvento },
  })
}

// ---- admin: lugares ---------------------------------
export async function crearLugar(input) {
  return apiFetch('/admin/lugares', { method: 'POST', body: input })
}

export async function actualizarLugar(id, input) {
  return apiFetch(`/admin/lugares/${encodeURIComponent(id)}`, { method: 'PUT', body: input })
}

export async function eliminarLugar(id) {
  return apiFetch(`/admin/lugares/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

// ---- admin: eventos ---------------------------------
// Lista para el panel admin (incluye pendientes/rechazados). Opcional: filtrar por estado.
export async function listarEventosAdmin(estado) {
  return apiFetch(`/admin/eventos${buildQuery({ estado })}`)
}

export async function cambiarEstadoEvento({ idEvento, estado }) {
  if (!['aprobado', 'rechazado', 'pendiente'].includes(estado)) {
    return { data: null, error: new Error('Estado inválido') }
  }
  return apiFetch(`/admin/eventos/${encodeURIComponent(idEvento)}/estado`, {
    method: 'PATCH',
    body: { estado },
  })
}

export async function crearEvento(input) {
  return apiFetch('/admin/eventos', { method: 'POST', body: input })
}

export async function actualizarEvento(id, input) {
  return apiFetch(`/admin/eventos/${encodeURIComponent(id)}`, { method: 'PUT', body: input })
}

export async function eliminarEvento(id) {
  return apiFetch(`/admin/eventos/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

// ---- admin: moderación de reseñas -------------------
export async function listarResenasAdmin() {
  return apiFetch('/admin/resenas')
}

export async function cambiarEstadoResena({ idResena, estado }) {
  if (!['visible', 'oculta', 'eliminada'].includes(estado)) {
    return { data: null, error: new Error('Estado inválido') }
  }
  return apiFetch(`/admin/resenas/${encodeURIComponent(idResena)}`, {
    method: 'PATCH',
    body: { estado },
  })
}
