// Cliente REST para el backend Spring Boot (EventOut).
// Centraliza la URL base, el token JWT y el manejo de respuestas en el
// contrato { data, error } que usa la app.

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
// Exportado para que AuthContext pueda filtrar el evento `storage` por esta clave
// (detectar borrado/cambio del token desde otra pestaña).
export const TOKEN_KEY = 'eventout_token'

// Manejador global de "sesión inválida". Lo registra AuthContext para no acoplar
// este módulo (agnóstico de React) al árbol de componentes. Se invoca cuando el
// backend rechaza una petición autenticada (401/403): típicamente token expirado
// o cuenta deshabilitada. Limpia el estado de sesión en React.
let onUnauthorized = null

export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

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

  // Sesión inválida: el backend rechaza una petición que SÍ llevaba token
  // (expirado o cuenta deshabilitada). Notificamos para limpiar la sesión local.
  // Solo si había token, para no interferir con el 401 de credenciales del login.
  if (token && (res.status === 401 || res.status === 403)) {
    onUnauthorized?.()
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
