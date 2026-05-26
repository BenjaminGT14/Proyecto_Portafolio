import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.warn(
    '[Entreteca] Falta configurar VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY en .env.local. ' +
    'La app funcionará con datos mock hasta que se conecte Supabase.',
  )
}

export const supabase = createClient(
  url ?? 'http://localhost:54321',
  anonKey ?? 'anon-key-placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)

export const isSupabaseConfigured = Boolean(url && anonKey)
