import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { comunasSantiago } from '@/lib/mockData'

export function FiltrosBar({
  categorias,
  filtros,
  setFiltros,
  mostrarCategoria = true,
  mostrarFecha = false,
}) {
  function update(patch) {
    setFiltros((prev) => ({ ...prev, ...patch }))
  }

  const tieneAlgun =
    filtros.q || filtros.idCategoria || filtros.comuna || filtros.costo || filtros.desde

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-12">
        <div className="md:col-span-4">
          <Label htmlFor="q" className="mb-1.5 block">
            Buscar
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="q"
              value={filtros.q ?? ''}
              onChange={(e) => update({ q: e.target.value })}
              placeholder="Nombre, descripción…"
              className="pl-9"
            />
          </div>
        </div>

        {mostrarCategoria && (
          <div className="md:col-span-3">
            <Label htmlFor="categoria" className="mb-1.5 block">
              Categoría
            </Label>
            <Select
              id="categoria"
              value={filtros.idCategoria ?? ''}
              onChange={(e) => update({ idCategoria: e.target.value || undefined })}
            >
              <option value="">Todas</option>
              {categorias?.map((c) => (
                <option key={c.id_categoria} value={c.id_categoria}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className={mostrarCategoria ? 'md:col-span-3' : 'md:col-span-4'}>
          <Label htmlFor="comuna" className="mb-1.5 block">
            Comuna
          </Label>
          <Select
            id="comuna"
            value={filtros.comuna ?? ''}
            onChange={(e) => update({ comuna: e.target.value || undefined })}
          >
            <option value="">Todas</option>
            {comunasSantiago.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="costo" className="mb-1.5 block">
            Costo
          </Label>
          <Select
            id="costo"
            value={filtros.costo ?? ''}
            onChange={(e) => update({ costo: e.target.value || undefined })}
          >
            <option value="">Todos</option>
            <option value="gratis">Gratis</option>
            <option value="pagado">Pagado</option>
          </Select>
        </div>

        {mostrarFecha && (
          <div className="md:col-span-3">
            <Label htmlFor="desde" className="mb-1.5 block">
              Desde
            </Label>
            <Input
              id="desde"
              type="date"
              value={filtros.desde ?? ''}
              onChange={(e) => update({ desde: e.target.value || undefined })}
            />
          </div>
        )}
      </div>

      {tieneAlgun && (
        <div className="mt-3 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFiltros({})}
          >
            <X className="h-4 w-4" />
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  )
}
