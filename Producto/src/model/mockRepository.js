// Implementación del repositorio en "modo demo" (sin Supabase). Vive separado y
// se carga de forma perezosa (import dinámico desde entretecaRepository) para que
// ni esta lógica ni los datos de mockData viajen en el bundle de producción.
import {
  categoriasMock,
  lugaresMock,
  eventosMock,
  resenasMock,
  votosMock,
  usuariosMock,
} from './mockData'

// === Estado mutable en memoria ===================================
const resenasState = [...resenasMock]
const votosState = [...votosMock]
const lugaresState = lugaresMock.map((l) => ({ ...l }))
const eventosState = eventosMock.map((e) => ({ ...e }))
const favoritosState = [] // [{ id_favorito, id_usuario, id_lugar?, id_evento? }]

function genId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function buscarUsuarioMock(id) {
  return usuariosMock.find((u) => u.id_usuario === id) ?? null
}

function agregarConteo(resena) {
  const votos = votosState.filter((v) => v.id_resena === resena.id_resena)
  const positivos = votos.filter((v) => v.es_positivo).length
  const negativos = votos.length - positivos
  return {
    ...resena,
    votos_positivos: positivos,
    votos_negativos: negativos,
    score: positivos - negativos,
    autor: buscarUsuarioMock(resena.id_usuario),
  }
}

function enriquecerLugar(lugar) {
  if (!lugar) return null
  const categoria = categoriasMock.find((c) => c.id_categoria === lugar.id_categoria)
  return { ...lugar, categoria }
}

function enriquecerEvento(evento) {
  if (!evento) return null
  const lugar = lugaresState.find((l) => l.id_lugar === evento.id_lugar)
  return { ...evento, lugar: lugar ?? evento.lugar ?? null }
}

// ---- categorías -------------------------------------
export function listarCategorias() {
  return { data: categoriasMock, error: null }
}

// ---- lugares ----------------------------------------
export function listarLugares({ idCategoria, comuna, costo, q } = {}) {
  let data = lugaresState.map(enriquecerLugar)
  if (idCategoria) data = data.filter((l) => l.id_categoria === idCategoria)
  if (comuna) data = data.filter((l) => l.comuna === comuna)
  if (costo === 'gratis') data = data.filter((l) => l.es_gratuito)
  if (costo === 'pagado') data = data.filter((l) => !l.es_gratuito)
  if (q) {
    const needle = q.toLowerCase()
    data = data.filter(
      (l) =>
        l.nombre.toLowerCase().includes(needle) ||
        l.descripcion?.toLowerCase().includes(needle),
    )
  }
  return { data, error: null }
}

// ---- eventos ----------------------------------------
export function listarEventos({ comuna, costo, q, desde } = {}) {
  let data = eventosState.map(enriquecerEvento)
  if (comuna) data = data.filter((e) => e.lugar?.comuna === comuna)
  if (costo === 'gratis') data = data.filter((e) => e.es_gratuito)
  if (costo === 'pagado') data = data.filter((e) => !e.es_gratuito)
  if (q) {
    const needle = q.toLowerCase()
    data = data.filter(
      (e) =>
        e.nombre.toLowerCase().includes(needle) ||
        e.descripcion?.toLowerCase().includes(needle),
    )
  }
  if (desde) data = data.filter((e) => new Date(e.fecha_inicio) >= new Date(desde))
  data.sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
  return { data, error: null }
}

// ---- detalle ----------------------------------------
export function obtenerLugar(id) {
  const lugar = lugaresState.find((l) => l.id_lugar === id)
  return { data: enriquecerLugar(lugar), error: lugar ? null : new Error('No encontrado') }
}

export function obtenerEvento(id) {
  const evento = eventosState.find((e) => e.id_evento === id)
  return { data: enriquecerEvento(evento), error: evento ? null : new Error('No encontrado') }
}

// ---- reseñas ----------------------------------------
export function listarResenas({ idLugar, idEvento } = {}) {
  const data = resenasState
    .flatMap((r) => {
      if (r.estado !== 'visible') return []
      const coincide = idLugar ? r.id_lugar === idLugar : r.id_evento === idEvento
      return coincide ? [agregarConteo(r)] : []
    })
    .sort((a, b) => b.score - a.score || new Date(b.created_at) - new Date(a.created_at))
  return { data, error: null }
}

export function publicarResena({
  idUsuario,
  idLugar = null,
  idEvento = null,
  titulo,
  contenido,
  puntuacion,
}) {
  const nueva = {
    id_resena: genId('r'),
    id_usuario: idUsuario,
    id_lugar: idLugar,
    id_evento: idEvento,
    titulo,
    contenido,
    puntuacion,
    estado: 'visible',
    created_at: new Date().toISOString(),
  }
  resenasState.unshift(nueva)
  return { data: agregarConteo(nueva), error: null }
}

export function votarResena({ idUsuario, idResena, esPositivo }) {
  const existente = votosState.find(
    (v) => v.id_resena === idResena && v.id_usuario === idUsuario,
  )
  if (existente) {
    if (existente.es_positivo === esPositivo) {
      // toggle: quitar el voto
      const idx = votosState.indexOf(existente)
      votosState.splice(idx, 1)
      return { data: null, error: null }
    }
    existente.es_positivo = esPositivo
    return { data: existente, error: null }
  }
  const nuevo = {
    id_voto: genId('v'),
    id_usuario: idUsuario,
    id_resena: idResena,
    es_positivo: esPositivo,
  }
  votosState.push(nuevo)
  return { data: nuevo, error: null }
}

export function obtenerVotosUsuario({ idUsuario, idsResenas }) {
  const data = votosState.filter(
    (v) => v.id_usuario === idUsuario && idsResenas.includes(v.id_resena),
  )
  return { data, error: null }
}

// ---- favoritos --------------------------------------
export function listarFavoritos({ idUsuario }) {
  const favs = favoritosState.filter((f) => f.id_usuario === idUsuario)
  const lugares = favs.flatMap((f) => {
    if (!f.id_lugar) return []
    const lugar = enriquecerLugar(lugaresState.find((l) => l.id_lugar === f.id_lugar))
    return lugar ? [lugar] : []
  })
  const eventos = favs.flatMap((f) => {
    if (!f.id_evento) return []
    const evento = enriquecerEvento(eventosState.find((e) => e.id_evento === f.id_evento))
    return evento ? [evento] : []
  })
  return { data: { lugares, eventos }, error: null }
}

export function obtenerEstadoFavoritos({ idUsuario, idLugares = [], idEventos = [] }) {
  const lugares = new Set(
    favoritosState.flatMap((f) =>
      f.id_usuario === idUsuario && idLugares.includes(f.id_lugar) ? [f.id_lugar] : [],
    ),
  )
  const eventos = new Set(
    favoritosState.flatMap((f) =>
      f.id_usuario === idUsuario && idEventos.includes(f.id_evento) ? [f.id_evento] : [],
    ),
  )
  return { data: { lugares, eventos }, error: null }
}

export function toggleFavorito({ idUsuario, idLugar = null, idEvento = null }) {
  const idx = favoritosState.findIndex(
    (f) =>
      f.id_usuario === idUsuario &&
      ((idLugar && f.id_lugar === idLugar) || (idEvento && f.id_evento === idEvento)),
  )
  if (idx >= 0) {
    favoritosState.splice(idx, 1)
    return { data: { activo: false }, error: null }
  }
  favoritosState.push({
    id_favorito: genId('fav'),
    id_usuario: idUsuario,
    id_lugar: idLugar,
    id_evento: idEvento,
  })
  return { data: { activo: true }, error: null }
}

// ---- admin: lugares ---------------------------------
export function crearLugar(input) {
  const nuevo = {
    id_lugar: genId('lugar'),
    created_at: new Date().toISOString(),
    es_gratuito: true,
    ...input,
  }
  lugaresState.unshift(nuevo)
  return { data: enriquecerLugar(nuevo), error: null }
}

export function actualizarLugar(id, input) {
  const idx = lugaresState.findIndex((l) => l.id_lugar === id)
  if (idx < 0) return { data: null, error: new Error('No encontrado') }
  lugaresState[idx] = { ...lugaresState[idx], ...input }
  return { data: enriquecerLugar(lugaresState[idx]), error: null }
}

export function eliminarLugar(id) {
  const idx = lugaresState.findIndex((l) => l.id_lugar === id)
  if (idx < 0) return { error: new Error('No encontrado') }
  lugaresState.splice(idx, 1)
  return { error: null }
}

// ---- admin: eventos ---------------------------------
export function crearEvento(input) {
  const nuevo = {
    id_evento: genId('evento'),
    created_at: new Date().toISOString(),
    es_gratuito: true,
    ...input,
  }
  eventosState.unshift(nuevo)
  return { data: enriquecerEvento(nuevo), error: null }
}

export function actualizarEvento(id, input) {
  const idx = eventosState.findIndex((e) => e.id_evento === id)
  if (idx < 0) return { data: null, error: new Error('No encontrado') }
  eventosState[idx] = { ...eventosState[idx], ...input }
  return { data: enriquecerEvento(eventosState[idx]), error: null }
}

export function eliminarEvento(id) {
  const idx = eventosState.findIndex((e) => e.id_evento === id)
  if (idx < 0) return { error: new Error('No encontrado') }
  eventosState.splice(idx, 1)
  return { error: null }
}

// ---- admin: moderación de reseñas -------------------
export function listarResenasAdmin() {
  const data = resenasState.map((r) => ({
    ...agregarConteo(r),
    lugar: r.id_lugar ? lugaresState.find((l) => l.id_lugar === r.id_lugar) : null,
    evento: r.id_evento ? eventosState.find((e) => e.id_evento === r.id_evento) : null,
  }))
  data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return { data, error: null }
}

export function cambiarEstadoResena({ idResena, estado }) {
  const r = resenasState.find((x) => x.id_resena === idResena)
  if (!r) return { data: null, error: new Error('No encontrada') }
  r.estado = estado
  return { data: r, error: null }
}
