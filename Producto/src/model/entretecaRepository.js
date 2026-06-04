import { supabase, isSupabaseConfigured } from '@/core/supabase'

// En modo demo (sin Supabase) toda la lógica vive en mockRepository, que se
// importa de forma perezosa para que ni esa lógica ni los datos de mockData
// viajen en el bundle de producción (donde isSupabaseConfigured siempre es true).
let mockPromise
function getMock() {
  if (!mockPromise) mockPromise = import('./mockRepository')
  return mockPromise
}

// Neutraliza los caracteres con significado en la gramática de filtros de
// PostgREST (.or()): coma separa condiciones, paréntesis agrupan, y el
// backslash/porcentaje afectan el patrón ilike. Evita que la búsqueda del
// usuario pueda reescribir el filtro o apuntar a otras columnas.
function sanitizarBusqueda(q) {
  return String(q).replace(/[\\,()%]/g, ' ').trim()
}

// ---- categorías -------------------------------------
export async function listarCategorias() {
  if (!isSupabaseConfigured) return (await getMock()).listarCategorias()
  return supabase
    .from('categoria')
    .select('id_categoria, nombre, icono')
    .order('nombre')
}

// ---- lugares ----------------------------------------
export async function listarLugares({ idCategoria, comuna, costo, q } = {}) {
  if (!isSupabaseConfigured) {
    return (await getMock()).listarLugares({ idCategoria, comuna, costo, q })
  }

  let query = supabase
    .from('lugar')
    .select('*, categoria:id_categoria (id_categoria, nombre, icono)')
    .order('nombre')

  if (idCategoria) query = query.eq('id_categoria', idCategoria)
  if (comuna) query = query.eq('comuna', comuna)
  if (costo === 'gratis') query = query.eq('es_gratuito', true)
  if (costo === 'pagado') query = query.eq('es_gratuito', false)
  if (q) {
    const s = sanitizarBusqueda(q)
    if (s) query = query.or(`nombre.ilike.%${s}%,descripcion.ilike.%${s}%`)
  }

  return query
}

// ---- eventos ----------------------------------------
export async function listarEventos({ comuna, costo, q, desde } = {}) {
  if (!isSupabaseConfigured) {
    return (await getMock()).listarEventos({ comuna, costo, q, desde })
  }

  let query = supabase
    .from('evento')
    .select('*, lugar:id_lugar (id_lugar, nombre, comuna, latitud, longitud)')
    .order('fecha_inicio', { ascending: true })

  if (costo === 'gratis') query = query.eq('es_gratuito', true)
  if (costo === 'pagado') query = query.eq('es_gratuito', false)
  if (q) {
    const s = sanitizarBusqueda(q)
    if (s) query = query.or(`nombre.ilike.%${s}%,descripcion.ilike.%${s}%`)
  }
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
  if (!isSupabaseConfigured) return (await getMock()).obtenerLugar(id)
  return supabase
    .from('lugar')
    .select('*, categoria:id_categoria (id_categoria, nombre, icono)')
    .eq('id_lugar', id)
    .maybeSingle()
}

// ---- detalle de evento ------------------------------
export async function obtenerEvento(id) {
  if (!isSupabaseConfigured) return (await getMock()).obtenerEvento(id)
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

  if (!isSupabaseConfigured) return (await getMock()).listarResenas({ idLugar, idEvento })

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
    return (await getMock()).publicarResena({
      idUsuario,
      idLugar,
      idEvento,
      titulo,
      contenido,
      puntuacion,
    })
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
    return (await getMock()).votarResena({ idUsuario, idResena, esPositivo })
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
    return (await getMock()).obtenerVotosUsuario({ idUsuario, idsResenas })
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

  if (!isSupabaseConfigured) return (await getMock()).listarFavoritos({ idUsuario })

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
      lugares: (lugares ?? []).flatMap((f) => (f.lugar ? [f.lugar] : [])),
      eventos: (eventos ?? []).flatMap((f) => (f.evento ? [f.evento] : [])),
    },
    error: null,
  }
}

export async function obtenerEstadoFavoritos({ idUsuario, idLugares = [], idEventos = [] }) {
  if (!idUsuario) return { data: { lugares: new Set(), eventos: new Set() }, error: null }

  if (!isSupabaseConfigured) {
    return (await getMock()).obtenerEstadoFavoritos({ idUsuario, idLugares, idEventos })
  }

  // Cada consulta se nombra explícitamente para no acoplar el resultado a la
  // posición dentro de un array (que dependía de cuántos filtros venían).
  const [resLugares, resEventos] = await Promise.all([
    idLugares.length
      ? supabase
          .from('favorito')
          .select('id_lugar')
          .eq('id_usuario', idUsuario)
          .in('id_lugar', idLugares)
      : Promise.resolve({ data: [] }),
    idEventos.length
      ? supabase
          .from('favorito')
          .select('id_evento')
          .eq('id_usuario', idUsuario)
          .in('id_evento', idEventos)
      : Promise.resolve({ data: [] }),
  ])
  const lugares = new Set(
    (resLugares.data ?? []).flatMap((r) => (r.id_lugar ? [r.id_lugar] : [])),
  )
  const eventos = new Set(
    (resEventos.data ?? []).flatMap((r) => (r.id_evento ? [r.id_evento] : [])),
  )
  return { data: { lugares, eventos }, error: null }
}

export async function toggleFavorito({ idUsuario, idLugar = null, idEvento = null }) {
  if (!idUsuario) return { data: null, error: new Error('Debes iniciar sesión') }
  if ((idLugar && idEvento) || (!idLugar && !idEvento)) {
    return { data: null, error: new Error('Debe ser un lugar o un evento') }
  }

  if (!isSupabaseConfigured) {
    return (await getMock()).toggleFavorito({ idUsuario, idLugar, idEvento })
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

// ---- helper: llamar edge functions admin -----------
async function callAdmin(fn, method, path = '', body = null) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) return { data: null, error: new Error('No autenticado') }

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${fn}${path}`
  let res
  try {
    res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: body != null ? JSON.stringify(body) : undefined,
    })
  } catch {
    return { data: null, error: new Error('Error de red al contactar Edge Function') }
  }
  let json
  try { json = await res.json() } catch { json = {} }
  if (!res.ok) return { data: null, error: new Error(json.error ?? 'Error en Edge Function') }
  return { data: json, error: null }
}

// ---- admin: lugares ---------------------------------
export async function crearLugar(input) {
  if (!isSupabaseConfigured) return (await getMock()).crearLugar(input)
  return callAdmin('admin-lugares', 'POST', '', input)
}

export async function actualizarLugar(id, input) {
  if (!isSupabaseConfigured) return (await getMock()).actualizarLugar(id, input)
  return callAdmin('admin-lugares', 'PUT', `/${id}`, input)
}

export async function eliminarLugar(id) {
  if (!isSupabaseConfigured) return (await getMock()).eliminarLugar(id)
  return callAdmin('admin-lugares', 'DELETE', `/${id}`)
}

// ---- admin: eventos ---------------------------------
export async function crearEvento(input) {
  if (!isSupabaseConfigured) return (await getMock()).crearEvento(input)
  return callAdmin('admin-eventos', 'POST', '', input)
}

export async function actualizarEvento(id, input) {
  if (!isSupabaseConfigured) return (await getMock()).actualizarEvento(id, input)
  return callAdmin('admin-eventos', 'PUT', `/${id}`, input)
}

export async function eliminarEvento(id) {
  if (!isSupabaseConfigured) return (await getMock()).eliminarEvento(id)
  return callAdmin('admin-eventos', 'DELETE', `/${id}`)
}

// ---- admin: moderación de reseñas -------------------
export async function listarResenasAdmin() {
  if (!isSupabaseConfigured) return (await getMock()).listarResenasAdmin()
  return callAdmin('admin-resenas', 'GET')
}

export async function cambiarEstadoResena({ idResena, estado }) {
  if (!['visible', 'oculta', 'eliminada'].includes(estado)) {
    return { data: null, error: new Error('Estado inválido') }
  }
  if (!isSupabaseConfigured) return (await getMock()).cambiarEstadoResena({ idResena, estado })
  return callAdmin('admin-resenas', 'PATCH', `/${idResena}`, { estado })
}
