import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase'
import { AuthLayout, ErrorBanner, SuccessBanner, SupabaseWarning } from './AuthShared'

export function RegistroPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const { data, error } = await signUp({ email, password, nombre })
    setLoading(false)

    if (error) {
      setError(error.message ?? 'No pudimos crear la cuenta')
      return
    }

    // Si Supabase requiere confirmación por correo, no hay sesión todavía.
    if (data?.session) {
      navigate('/', { replace: true })
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <AuthLayout title="Revisa tu correo" subtitle="Te enviamos un enlace para confirmar tu cuenta">
        <SuccessBanner message="Cuenta creada. Confirma tu correo para activar el ingreso." />
        <Link
          to="/login"
          className="mt-6 inline-block text-sm font-medium text-secondary hover:underline"
        >
          Ir a ingresar
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Crear cuenta" subtitle="Únete a la comunidad de Entreteca">
      {!isSupabaseConfigured && <SupabaseWarning />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Cómo quieres que te veamos"
          />
        </div>
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
        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirmar contraseña</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {error && <ErrorBanner message={error} />}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-medium text-secondary hover:underline">
          Ingresar
        </Link>
      </p>
    </AuthLayout>
  )
}
