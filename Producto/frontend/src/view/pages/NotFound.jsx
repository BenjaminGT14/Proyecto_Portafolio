import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="mx-auto w-full max-w-xl py-16 text-center">
      <p className="text-sm font-medium text-secondary">404</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Página no encontrada</h1>
      <p className="mt-2 text-slate-600">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block text-sm font-medium text-secondary hover:underline"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
