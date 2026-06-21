import { Link } from 'react-router-dom'
import { Button } from '@/view/components/ui/Button'
import { Input } from '@/view/components/ui/Input'
import { Label } from '@/view/components/ui/Label'
import { useRegistroViewModel } from '@/viewmodel/auth/useRegistroViewModel'
import { AuthLayout, Banner } from './AuthShared'

export function RegistroPage() {
  const vm = useRegistroViewModel()

  if (vm.done) {
    return (
      <AuthLayout title="Revisa tu correo" subtitle="Te enviamos un enlace para confirmar tu cuenta">
        <Banner tone="success" message="Cuenta creada. Confirma tu correo para activar el ingreso." />
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
      <form onSubmit={vm.handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            required
            value={vm.nombre}
            onChange={(e) => vm.setNombre(e.target.value)}
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
            value={vm.email}
            onChange={(e) => vm.setEmail(e.target.value)}
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
            value={vm.password}
            onChange={(e) => vm.setPassword(e.target.value)}
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
            value={vm.confirm}
            onChange={(e) => vm.setConfirm(e.target.value)}
          />
        </div>

        {vm.error && <Banner message={vm.error} />}

        <Button type="submit" className="w-full" disabled={vm.loading}>
          {vm.loading ? 'Creando cuenta…' : 'Crear cuenta'}
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
