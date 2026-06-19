import { useEffect, useState, useCallback } from 'react'
import { apiFetch, getToken, setToken, clearToken } from '@/core/api'
import { AuthContext } from './authContextObject'

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null)
  // Si hay token guardado, arrancamos en "cargando" hasta validar con /auth/me.
  const [loading, setLoading] = useState(Boolean(getToken()))

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
    isAuthenticated: Boolean(profile),
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
