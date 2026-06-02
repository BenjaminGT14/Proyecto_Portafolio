import { Link } from 'react-router-dom'
import { Construction } from 'lucide-react'

// Página genérica "en construcción". Se mantiene por si se necesita en el futuro.
export function PlaceholderPage({ titulo, descripcion }) {
  return (
    <div className="mx-auto w-full max-w-xl rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <Construction className="mx-auto mb-3 size-10 text-slate-400" />
      <h1 className="text-xl font-bold text-slate-900">{titulo}</h1>
      <p className="mt-2 text-sm text-slate-600">{descripcion}</p>
      <Link to="/" className="mt-6 inline-block text-sm font-medium text-secondary hover:underline">
        Volver al inicio
      </Link>
    </div>
  )
}
