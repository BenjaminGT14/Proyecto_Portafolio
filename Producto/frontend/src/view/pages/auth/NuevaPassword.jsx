import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/core/auth/useAuth'
import { Button } from '@/view/components/ui/Button'
import { Input } from '@/view/components/ui/Input'
import { Label } from '@/view/components/ui/Label'
import { AuthLayout, Banner } from './AuthShared'

export function NuevaPasswordPage() {
  const navigate = useNavigate()
  const { nuevaPassword } = useAuth()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!token) {
      setError('El enlace de recuperación no es válido o está incompleto.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    const { error: updateError } = await nuevaPassword({ token, password })
    setLoading(false)
    if (updateError) {
      setError(updateError.message ?? 'No pudimos actualizar la contraseña')
      return
    }
    setDone(true)
    setTimeout(() => navigate('/login', { replace: true }), 2500)
  }

  return (
    <AuthLayout title="Nueva contraseña" subtitle="Elige una contraseña segura para tu cuenta">
      {done ? (
        <Banner tone="success" message="Contraseña actualizada correctamente. Redirigiendo al ingreso…" />
      ) : !token ? (
        <>
          <Banner message="Falta el token de recuperación. Solicita un nuevo enlace." />
          <Link
            to="/recuperar-password"
            className="mt-6 inline-block text-sm font-medium text-secondary hover:underline"
          >
            Volver a solicitar enlace
          </Link>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">Nueva contraseña</Label>
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
          {error && <Banner message={error} />}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Guardando…' : 'Guardar contraseña'}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
