import { Link } from 'react-router-dom'
import { Button } from '@/view/components/ui/Button'
import { Input } from '@/view/components/ui/Input'
import { Label } from '@/view/components/ui/Label'
import { useRecuperarPasswordViewModel } from '@/viewmodel/auth/useRecuperarPasswordViewModel'
import { AuthLayout, ErrorBanner, SuccessBanner } from './AuthShared'

export function RecuperarPasswordPage() {
  const vm = useRecuperarPasswordViewModel()

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Te enviamos un enlace al correo para restablecerla"
    >
      {vm.sent ? (
        <SuccessBanner message={`Si existe una cuenta con ${vm.email}, recibirás un correo en unos minutos.`} />
      ) : (
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

          {vm.error && <ErrorBanner message={vm.error} />}

          <Button type="submit" className="w-full" disabled={vm.loading}>
            {vm.loading ? 'Enviando…' : 'Enviar enlace'}
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
