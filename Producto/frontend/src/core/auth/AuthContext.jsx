import { useEffect, useState, useCallback } from 'react'
import { apiFetch, getToken, setToken, clearToken, setUnauthorizedHandler, TOKEN_KEY } from '@/core/api'
import { AuthContext } from './authContextObject'

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null)
  // Si hay token guardado, arrancamos en "cargando" hasta validar con /auth/me.
  const [loading, setLoading] = useState(Boolean(getToken()))

  // Sesión inválida detectada por la capa REST (401/403 con token: expirado o
  // cuenta deshabilitada). Limpiamos token + estado global; el redirect a /login
  // lo hace ProtectedRoute al quedar la sesión sin perfil.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearToken()
      setProfile(null)
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    apiFetch('/auth/me').then(({ data, error }) => {
      if (cancelled) return
      if (error || !data) {
        clearToken()
        setProfile(null)
      } else {
        setProfile(data)
      }
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Revalidación de sesión sin recargar. El estado del usuario puede cambiar en
  // BD (p. ej. cuenta bloqueada por un admin). Consulta /auth/me en segundo plano
  // y limpia la sesión si el backend la rechaza. Silenciosa: no togglea `loading`.
  const revalidarSesion = useCallback(async () => {
    // Sin token (expiró, se borró a mano en DevTools, o se cerró sesión en otra
    // pestaña): cerramos la sesión local. No salimos temprano —eso dejaba el perfil
    // vivo hasta el refresh—. El redirect lo hace ProtectedRoute al no haber perfil.
    if (!getToken()) {
      setProfile(null)
      return
    }
    const { data, error } = await apiFetch('/auth/me')
    if (error || !data) {
      clearToken()
      setProfile(null)
    } else {
      setProfile(data)
    }
  }, [])

  // Mientras hay sesión activa, revalida periódicamente (30s) y, además, en cuanto
  // el usuario vuelve a la pestaña (focus/visibilidad) o el token cambia en otra
  // pestaña (evento storage), para detectar el bloqueo o el borrado del token casi
  // al instante, sin esperar a un refresh manual.
  const isAuthenticated = Boolean(profile)
  useEffect(() => {
    if (!isAuthenticated) return
    const id = setInterval(revalidarSesion, 30000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') revalidarSesion()
    }
    // `storage` solo se dispara en OTRAS pestañas del mismo origen: cubre logout o
    // borrado del token desde otra pestaña/ventana. e.key === null => localStorage.clear().
    const onStorage = (e) => {
      if (e.key === null || e.key === TOKEN_KEY) revalidarSesion()
    }
    window.addEventListener('focus', revalidarSesion)
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('storage', onStorage)
    return () => {
      clearInterval(id)
      window.removeEventListener('focus', revalidarSesion)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('storage', onStorage)
    }
  }, [isAuthenticated, revalidarSesion])

  const signUp = useCallback(async ({ email, password, nombre }) => {
    const { data, error } = await apiFetch('/auth/register', {
      method: 'POST',
      body: { email, password, nombre },
    })
    if (error) return { data: null, error }
    setToken(data.token)
    setProfile(data.usuario)
    // session truthy => el viewmodel de registro navega directo al home (auto-login).
    return { data: { session: true, usuario: data.usuario }, error: null }
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await apiFetch('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    if (error) return { data: null, error }
    setToken(data.token)
    setProfile(data.usuario)
    return { data: { session: true, usuario: data.usuario }, error: null }
  }, [])

  const signOut = useCallback(async () => {
    clearToken()
    setProfile(null)
    return { error: null }
  }, [])

  const resetPassword = useCallback(async ({ email }) => {
    return apiFetch('/auth/recuperar-password', { method: 'POST', body: { email } })
  }, [])

  const nuevaPassword = useCallback(async ({ token, password }) => {
    return apiFetch('/auth/nueva-password', { method: 'POST', body: { token, password } })
  }, [])

  const user = profile ? { id: profile.id_usuario, email: profile.email } : null

  const value = {
    user,
    profile,
    loading,
    isAuthenticated,
    isAdmin: profile?.rol === 'admin',
    isDemo: false,
    signUp,
    signIn,
    signOut,
    resetPassword,
    nuevaPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
