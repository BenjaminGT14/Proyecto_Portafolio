// Cliente REST para el backend Spring Boot (Eventout).
// Reemplaza al cliente de Supabase. Centraliza la URL base, el token JWT y el
// manejo de respuestas en el contrato { data, error } que usa la app.

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
const TOKEN_KEY = 'eventout_token'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* almacenamiento no disponible */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* almacenamiento no disponible */
  }
}

/**
 * Llama a la API y devuelve siempre { data, error }.
 * - Adjunta el JWT (Authorization: Bearer) si existe.
 * - 204 No Content -> { data: null, error: null }.
 * - Si !res.ok -> error con el mensaje del backend ({ "error": "..." }).
 */
export async function apiFetch(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    return { data: null, error: new Error('No se pudo conectar con el servidor') }
  }

  if (res.status === 204) return { data: null, error: null }

  let json = null
  const text = await res.text()
  if (text) {
    try {
      json = JSON.parse(text)
    } catch {
      json = null
    }
  }

  if (!res.ok) {
    return { data: null, error: new Error(json?.error ?? `Error ${res.status}`) }
  }
  return { data: json, error: null }
}

/** Construye un querystring omitiendo valores vacíos. Los arrays se unen por coma. */
export function buildQuery(params) {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) {
      if (value.length) sp.append(key, value.join(','))
    } else {
      sp.append(key, value)
    }
  })
  const s = sp.toString()
  return s ? `?${s}` : ''
}
