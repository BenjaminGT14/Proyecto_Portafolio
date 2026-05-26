import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { AuthContext } from './authContextObject'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id
  useEffect(() => {
    if (!userId || !isSupabaseConfigured) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(null)
      return
    }
    supabase
      .from('usuario')
      .select('*')
      .eq('id_usuario', userId)
      .maybeSingle()
      .then(({ data }) => setProfile(data))
  }, [userId])

  const signUp = useCallback(async ({ email, password, nombre }) => {
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    })
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    return supabase.auth.signInWithPassword({ email, password })
  }, [])

  const signOut = useCallback(async () => {
    return supabase.auth.signOut()
  }, [])

  const resetPassword = useCallback(async ({ email }) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/recuperar-password/nueva`,
    })
  }, [])

  // En modo mock (sin Supabase) usamos un "usuario demo" para que el flujo
  // de reseñas y votos sea demostrable end-to-end sin login real.
  const demoUser = !isSupabaseConfigured
    ? { id: 'u-demo', email: 'demo@entreteca.cl' }
    : null
  const demoProfile = !isSupabaseConfigured
    ? {
        id_usuario: 'u-demo',
        nombre: 'Demo',
        avatar_url: 'https://api.dicebear.com/9.x/initials/svg?seed=Demo&backgroundColor=c04f23&textColor=ffffff&radius=50',
        rol: 'admin', // en modo demo tiene rol admin para que el panel sea testeable
      }
    : null

  const profileEfectivo = profile ?? demoProfile

  const value = {
    session,
    user: session?.user ?? demoUser,
    profile: profileEfectivo,
    loading,
    isAuthenticated: Boolean(session) || !isSupabaseConfigured,
    isAdmin: profileEfectivo?.rol === 'admin',
    isDemo: !isSupabaseConfigured,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
