import { supabase, isSupabaseConfigured } from './supabase'
import {
  categoriasMock,
  lugaresMock,
  eventosMock,
  resenasMock,
  votosMock,
  usuariosMock,
} from './mockData'

// === Estado mutable para el modo mock ============================
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
export async function listarCategorias() {
  if (!isSupabaseConfigured) return { data: categoriasMock, error: null }
  return supabase
    .from('categoria')
    .select('id_categoria, nombre, icono')
    .order('nombre')
}

// ---- lugares ----------------------------------------
export async function listarLugares({ idCategoria, comuna, costo, q } = {}) {
  if (!isSupabaseConfigured) {
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

  let query = supabase
    .from('lugar')
    .select('*, categoria:id_categoria (id_categoria, nombre, icono)')
    .order('nombre')

  if (idCategoria) query = query.eq('id_categoria', idCategoria)
  if (comuna) query = query.eq('comuna', comuna)
  if (costo === 'gratis') query = query.eq('es_gratuito', true)
  if (costo === 'pagado') query = query.eq('es_gratuito', false)
  if (q) query = query.ilike('nombre', `%${q}%`)

  return query
}

// ---- eventos ----------------------------------------
export async function listarEventos({ comuna, costo, q, desde } = {}) {
  if (!isSupabaseConfigured) {
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

  let query = supabase
    .from('evento')
    .select('*, lugar:id_lugar (id_lugar, nombre, comuna)')
    .order('fecha_inicio', { ascending: true })

  if (costo === 'gratis') query = query.eq('es_gratuito', true)
  if (costo === 'pagado') query = query.eq('es_gratuito', false)
  if (q) query = query.ilike('nombre', `%${q}%`)
  if (desde) query = query.gte('fecha_inicio', desde)

  const result = await query
  if (result.error) return result

  // filtro de comuna se aplica en memoria porque viene del join
  if (comuna) {
    result.data = result.data.filter((e) => e.lugar?.comuna === comuna)
  }
  return result
}

// ---- detalle de lugar -------------------------------
export async function obtenerLugar(id) {
  if (!isSupabaseConfigured) {
    const lugar = lugaresState.find((l) => l.id_lugar === id)
    return { data: enriquecerLugar(lugar), error: lugar ? null : new Error('No encontrado') }
  }
  return supabase
    .from('lugar')
    .select('*, categoria:id_categoria (id_categoria, nombre, icono)')
    .eq('id_lugar', id)
    .maybeSingle()
}

// ---- detalle de evento ------------------------------
export async function obtenerEvento(id) {
  if (!isSupabaseConfigured) {
    const evento = eventosState.find((e) => e.id_evento === id)
    return { data: enriquecerEvento(evento), error: evento ? null : new Error('No encontrado') }
  }
  return supabase
    .from('evento')
    .select(
      '*, lugar:id_lugar (id_lugar, nombre, direccion, comuna, latitud, longitud, imagen_url)',
    )
    .eq('id_evento', id)
    .maybeSingle()
}

// ---- reseñas ----------------------------------------
export async function listarResenas({ idLugar, idEvento } = {}) {
  if (!idLugar && !idEvento) {
    return { data: [], error: new Error('idLugar o idEvento requerido') }
  }

  if (!isSupabaseConfigured) {
    const data = resenasState
      .filter((r) => r.estado === 'visible')
      .filter((r) => (idLugar ? r.id_lugar === idLugar : r.id_evento === idEvento))
      .map(agregarConteo)
      .sort((a, b) => b.score - a.score || new Date(b.created_at) - new Date(a.created_at))
    return { data, error: null }
  }

  // Supabase: leer de la vista resena_con_votos para tener el conteo agregado.
  let query = supabase
    .from('resena_con_votos')
    .select('*, autor:id_usuario (id_usuario, nombre, avatar_url)')
    .eq('estado', 'visible')
    .order('votos_positivos', { ascending: false })
    .order('created_at', { ascending: false })

  if (idLugar) query = query.eq('id_lugar', idLugar)
  else query = query.eq('id_evento', idEvento)

  return query
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

  if (!isSupabaseConfigured) {
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

  return supabase
    .from('resena')
    .insert({
      id_usuario: idUsuario,
      id_lugar: idLugar,
      id_evento: idEvento,
      titulo,
      contenido,
      puntuacion,
    })
    .select()
    .single()
}

export async function votarResena({ idUsuario, idResena, esPositivo }) {
  if (!idUsuario) return { data: null, error: new Error('Debes iniciar sesión') }

  if (!isSupabaseConfigured) {
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

  // Supabase: upsert sobre (id_usuario, id_resena). Si vuelve a votar
  // lo mismo, lo borramos para imitar el toggle del modo mock.
  const { data: existente } = await supabase
    .from('voto_resena')
    .select('*')
    .eq('id_usuario', idUsuario)
    .eq('id_resena', idResena)
    .maybeSingle()

  if (existente?.es_positivo === esPositivo) {
    return supabase.from('voto_resena').delete().eq('id_voto', existente.id_voto)
  }

  return supabase
    .from('voto_resena')
    .upsert(
      { id_usuario: idUsuario, id_resena: idResena, es_positivo: esPositivo },
      { onConflict: 'id_usuario,id_resena' },
    )
    .select()
    .single()
}

export async function obtenerVotosUsuario({ idUsuario, idsResenas }) {
  if (!idUsuario || !idsResenas?.length) return { data: [], error: null }

  if (!isSupabaseConfigured) {
    const data = votosState.filter(
      (v) => v.id_usuario === idUsuario && idsResenas.includes(v.id_resena),
    )
    return { data, error: null }
  }

  return supabase
    .from('voto_resena')
    .select('*')
    .eq('id_usuario', idUsuario)
    .in('id_resena', idsResenas)
}

// ---- favoritos --------------------------------------
export async function listarFavoritos({ idUsuario }) {
  if (!idUsuario) return { data: [], error: null }

  if (!isSupabaseConfigured) {
    const favs = favoritosState.filter((f) => f.id_usuario === idUsuario)
    const lugares = favs
      .filter((f) => f.id_lugar)
      .map((f) => enriquecerLugar(lugaresState.find((l) => l.id_lugar === f.id_lugar)))
      .filter(Boolean)
    const eventos = favs
      .filter((f) => f.id_evento)
      .map((f) => enriquecerEvento(eventosState.find((e) => e.id_evento === f.id_evento)))
      .filter(Boolean)
    return { data: { lugares, eventos }, error: null }
  }

  const [{ data: lugares }, { data: eventos }] = await Promise.all([
    supabase
      .from('favorito')
      .select('lugar:id_lugar (*, categoria:id_categoria (id_categoria, nombre, icono))')
      .eq('id_usuario', idUsuario)
      .not('id_lugar', 'is', null),
    supabase
      .from('favorito')
      .select('evento:id_evento (*, lugar:id_lugar (id_lugar, nombre, comuna))')
      .eq('id_usuario', idUsuario)
      .not('id_evento', 'is', null),
  ])

  return {
    data: {
      lugares: (lugares ?? []).map((f) => f.lugar).filter(Boolean),
      eventos: (eventos ?? []).map((f) => f.evento).filter(Boolean),
    },
    error: null,
  }
}

export async function obtenerEstadoFavoritos({ idUsuario, idLugares = [], idEventos = [] }) {
  if (!idUsuario) return { data: { lugares: new Set(), eventos: new Set() }, error: null }

  if (!isSupabaseConfigured) {
    const lugares = new Set(
      favoritosState
        .filter((f) => f.id_usuario === idUsuario && idLugares.includes(f.id_lugar))
        .map((f) => f.id_lugar),
    )
    const eventos = new Set(
      favoritosState
        .filter((f) => f.id_usuario === idUsuario && idEventos.includes(f.id_evento))
        .map((f) => f.id_evento),
    )
    return { data: { lugares, eventos }, error: null }
  }

  const queries = []
  if (idLugares.length) {
    queries.push(
      supabase
        .from('favorito')
        .select('id_lugar')
        .eq('id_usuario', idUsuario)
        .in('id_lugar', idLugares),
    )
  }
  if (idEventos.length) {
    queries.push(
      supabase
        .from('favorito')
        .select('id_evento')
        .eq('id_usuario', idUsuario)
        .in('id_evento', idEventos),
    )
  }
  const results = await Promise.all(queries)
  const lugares = new Set(
    (results[0]?.data ?? []).map((r) => r.id_lugar).filter(Boolean),
  )
  const eventos = new Set(
    (results[idLugares.length ? 1 : 0]?.data ?? [])
      .map((r) => r.id_evento)
      .filter(Boolean),
  )
  return { data: { lugares, eventos }, error: null }
}

export async function toggleFavorito({ idUsuario, idLugar = null, idEvento = null }) {
  if (!idUsuario) return { data: null, error: new Error('Debes iniciar sesión') }
  if ((idLugar && idEvento) || (!idLugar && !idEvento)) {
    return { data: null, error: new Error('Debe ser un lugar o un evento') }
  }

  if (!isSupabaseConfigured) {
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

  const filtro = idLugar
    ? supabase.from('favorito').select('id_favorito').eq('id_usuario', idUsuario).eq('id_lugar', idLugar).maybeSingle()
    : supabase.from('favorito').select('id_favorito').eq('id_usuario', idUsuario).eq('id_evento', idEvento).maybeSingle()
  const { data: existente } = await filtro

  if (existente) {
    await supabase.from('favorito').delete().eq('id_favorito', existente.id_favorito)
    return { data: { activo: false }, error: null }
  }

  await supabase.from('favorito').insert({
    id_usuario: idUsuario,
    id_lugar: idLugar,
    id_evento: idEvento,
  })
  return { data: { activo: true }, error: null }
}

// ---- admin: lugares ---------------------------------
export async function crearLugar(input) {
  if (!isSupabaseConfigured) {
    const nuevo = {
      id_lugar: genId('lugar'),
      created_at: new Date().toISOString(),
      es_gratuito: true,
      ...input,
    }
    lugaresState.unshift(nuevo)
    return { data: enriquecerLugar(nuevo), error: null }
  }
  return supabase.from('lugar').insert(input).select().single()
}

export async function actualizarLugar(id, input) {
  if (!isSupabaseConfigured) {
    const idx = lugaresState.findIndex((l) => l.id_lugar === id)
    if (idx < 0) return { data: null, error: new Error('No encontrado') }
    lugaresState[idx] = { ...lugaresState[idx], ...input }
    return { data: enriquecerLugar(lugaresState[idx]), error: null }
  }
  return supabase.from('lugar').update(input).eq('id_lugar', id).select().single()
}

export async function eliminarLugar(id) {
  if (!isSupabaseConfigured) {
    const idx = lugaresState.findIndex((l) => l.id_lugar === id)
    if (idx < 0) return { error: new Error('No encontrado') }
    lugaresState.splice(idx, 1)
    return { error: null }
  }
  return supabase.from('lugar').delete().eq('id_lugar', id)
}

// ---- admin: eventos ---------------------------------
export async function crearEvento(input) {
  if (!isSupabaseConfigured) {
    const nuevo = {
      id_evento: genId('evento'),
      created_at: new Date().toISOString(),
      es_gratuito: true,
      ...input,
    }
    eventosState.unshift(nuevo)
    return { data: enriquecerEvento(nuevo), error: null }
  }
  return supabase.from('evento').insert(input).select().single()
}

export async function actualizarEvento(id, input) {
  if (!isSupabaseConfigured) {
    const idx = eventosState.findIndex((e) => e.id_evento === id)
    if (idx < 0) return { data: null, error: new Error('No encontrado') }
    eventosState[idx] = { ...eventosState[idx], ...input }
    return { data: enriquecerEvento(eventosState[idx]), error: null }
  }
  return supabase.from('evento').update(input).eq('id_evento', id).select().single()
}

export async function eliminarEvento(id) {
  if (!isSupabaseConfigured) {
    const idx = eventosState.findIndex((e) => e.id_evento === id)
    if (idx < 0) return { error: new Error('No encontrado') }
    eventosState.splice(idx, 1)
    return { error: null }
  }
  return supabase.from('evento').delete().eq('id_evento', id)
}

// ---- admin: moderación de reseñas -------------------
export async function listarResenasAdmin() {
  if (!isSupabaseConfigured) {
    const data = resenasState.map((r) => ({
      ...agregarConteo(r),
      lugar: r.id_lugar ? lugaresState.find((l) => l.id_lugar === r.id_lugar) : null,
      evento: r.id_evento ? eventosState.find((e) => e.id_evento === r.id_evento) : null,
    }))
    data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return { data, error: null }
  }
  return supabase
    .from('resena_con_votos')
    .select(
      '*, autor:id_usuario (nombre, avatar_url), lugar:id_lugar (id_lugar, nombre), evento:id_evento (id_evento, nombre)',
    )
    .order('created_at', { ascending: false })
}

export async function cambiarEstadoResena({ idResena, estado }) {
  if (!['visible', 'oculta', 'eliminada'].includes(estado)) {
    return { data: null, error: new Error('Estado inválido') }
  }
  if (!isSupabaseConfigured) {
    const r = resenasState.find((x) => x.id_resena === idResena)
    if (!r) return { data: null, error: new Error('No encontrada') }
    r.estado = estado
    return { data: r, error: null }
  }
  return supabase
    .from('resena')
    .update({ estado })
    .eq('id_resena', idResena)
    .select()
    .single()
}
