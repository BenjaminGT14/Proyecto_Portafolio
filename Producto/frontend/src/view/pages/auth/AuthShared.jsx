import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="mx-auto w-full max-w-md py-8">
      <Link to="/" className="mb-6 flex items-center justify-center gap-2 text-secondary">
        <Compass className="size-7" />
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

const BANNER_TONES = {
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-green-200 bg-green-50 text-green-700',
}

export function Banner({ tone = 'error', message }) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${BANNER_TONES[tone]}`}>
      {message}
    </div>
  )
}
