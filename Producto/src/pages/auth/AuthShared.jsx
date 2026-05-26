import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="mx-auto w-full max-w-md py-8">
      <Link to="/" className="mb-6 flex items-center justify-center gap-2 text-secondary">
        <Compass className="h-7 w-7" />
        <span className="text-xl font-bold tracking-tight">Entreteca</span>
      </Link>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}

export function ErrorBanner({ message }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </div>
  )
}

export function SuccessBanner({ message }) {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
      {message}
    </div>
  )
}

export function SupabaseWarning() {
  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
      Supabase no está configurado. Copia <code>.env.example</code> a <code>.env.local</code> y
      completa las credenciales para activar autenticación.
    </div>
  )
}
