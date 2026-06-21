// Campos del formulario de evento, reutilizados por el panel admin (alta/edición)
// y por la página pública "Proponer evento" (propuesta de usuario). Es
// presentacional: recibe el estado del formulario y el setter desde el viewmodel.

const INPUT_CLS =
  'w-full rounded-lg border border-outline-variant px-3 py-2 text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary'

// Default estable: un [] inline crearía un array nuevo en cada render y rompería
// la memoización de los hijos que comparan props.
const EMPTY_LUGARES = []

function Field({ label, children }) {
  // El control se anida dentro del <label> para asociarlo a su texto
  // (un lector de pantalla anuncia la etiqueta al enfocar el campo).
  return (
    <label className="block space-y-1">
      <span className="block text-xs font-medium text-on-surface-variant">{label}</span>
      {children}
    </label>
  )
}

export function EventoFormFields({ form, setField, lugares = EMPTY_LUGARES }) {
  return (
    <>
      <Field label="Nombre *">
        <input
          required
          aria-label="Nombre"
          value={form.nombre}
          onChange={(e) => setField('nombre', e.target.value)}
          className={INPUT_CLS}
        />
      </Field>
      <Field label="Descripción">
        <textarea
          aria-label="Descripción"
          value={form.descripcion}
          onChange={(e) => setField('descripcion', e.target.value)}
          rows={3}
          className={INPUT_CLS}
        />
      </Field>
      <Field label="Lugar">
        <select
          value={form.id_lugar}
          onChange={(e) => setField('id_lugar', e.target.value)}
          className={INPUT_CLS}
        >
          <option value="">Sin lugar asignado</option>
          {lugares.map((l) => (
            <option key={l.id_lugar} value={l.id_lugar}>
              {l.nombre}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Fecha inicio *">
          <input
            required
            type="datetime-local"
            aria-label="Fecha inicio"
            value={form.fecha_inicio}
            onChange={(e) => setField('fecha_inicio', e.target.value)}
            className={INPUT_CLS}
          />
        </Field>
        <Field label="Fecha término">
          <input
            type="datetime-local"
            aria-label="Fecha término"
            value={form.fecha_fin}
            onChange={(e) => setField('fecha_fin', e.target.value)}
            className={INPUT_CLS}
          />
        </Field>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.es_gratuito}
            onChange={(e) => setField('es_gratuito', e.target.checked)}
            className="size-4 accent-secondary"
          />
          Es gratuito
        </label>
        {!form.es_gratuito && (
          <Field label="Precio (CLP)">
            <input
              type="number"
              aria-label="Precio (CLP)"
              value={form.precio}
              onChange={(e) => setField('precio', e.target.value)}
              className={INPUT_CLS}
            />
          </Field>
        )}
      </div>
      <Field label="URL de imagen">
        <input
          type="url"
          aria-label="URL de imagen"
          value={form.imagen_url}
          onChange={(e) => setField('imagen_url', e.target.value)}
          className={INPUT_CLS}
        />
      </Field>
    </>
  )
}
