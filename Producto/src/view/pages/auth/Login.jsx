import { Link } from 'react-router-dom'
import { Button } from '@/view/components/ui/Button'
import { Input } from '@/view/components/ui/Input'
import { Label } from '@/view/components/ui/Label'
import { isSupabaseConfigured } from '@/core/supabase'
import { useLoginViewModel } from '@/viewmodel/auth/useLoginViewModel'
import { AuthLayout, ErrorBanner, SupabaseWarning } from './AuthShared'

export function LoginPage() {
  const vm = useLoginViewModel()

  return (
    <AuthLayout title="Ingresar" subtitle="Bienvenido de vuelta a Entreteca">
      {!isSupabaseConfigured && <SupabaseWarning />}
      <form onSubmit={vm.handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={vm.email}
            onChange={(e) => vm.setEmail(e.target.value)}
            placeholder="tu@correo.cl"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link to="/recuperar-password" className="text-xs text-secondary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            value={vm.password}
            onChange={(e) => vm.setPassword(e.target.value)}
          />
        </div>

        {vm.error && <ErrorBanner message={vm.error} />}

        <Button type="submit" className="w-full" disabled={vm.loading}>
          {vm.loading ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="font-medium text-secondary hover:underline">
          Crea una aquí
        </Link>
      </p>
    </AuthLayout>
  )
}
