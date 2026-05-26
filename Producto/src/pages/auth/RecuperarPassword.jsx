import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase'
import { AuthLayout, ErrorBanner, SuccessBanner, SupabaseWarning } from './AuthShared'

export function RecuperarPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await resetPassword({ email })
    setLoading(false)
    if (error) {
      setError(error.message ?? 'No pudimos enviar el correo')
      return
    }
    setSent(true)
  }

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Te enviamos un enlace al correo para restablecerla"
    >
      {!isSupabaseConfigured && <SupabaseWarning />}

      {sent ? (
        <SuccessBanner message={`Si existe una cuenta con ${email}, recibirás un correo en unos minutos.`} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.cl"
            />
          </div>

          {error && <ErrorBanner message={error} />}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Enviando…' : 'Enviar enlace'}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-600">
        <Link to="/login" className="font-medium text-secondary hover:underline">
          Volver a ingresar
        </Link>
      </p>
    </AuthLayout>
  )
}
