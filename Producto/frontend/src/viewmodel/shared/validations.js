// Validaciones de dominio compartidas por los viewmodels (capa MVVM).
// El backend es la fuente de verdad; estas validaciones mejoran la UX dando
// feedback inmediato y evitando viajes innecesarios al servidor.

/** Tolerancia (ms) para no rechazar un inicio "ahora mismo" por el desfase del envío. */
const TOLERANCIA_MS = 60_000

/**
 * Devuelve el instante actual con formato `YYYY-MM-DDTHH:mm` (hora local del
 * navegador), apto para el atributo `min` de un <input type="datetime-local">.
 */
export function ahoraDatetimeLocal() {
  const ahora = new Date()
  const offset = ahora.getTimezoneOffset() * 60_000
  return new Date(ahora.getTime() - offset).toISOString().slice(0, 16)
}

/**
 * Valida la coherencia de las fechas de un evento. Espeja la regla del backend
 * (FechasEventoValidator). Devuelve un mensaje de error o `null` si es válido.
 * @param {{ fecha_inicio?: string, fecha_fin?: string }} form
 */
export function validarFechasEvento({ fecha_inicio, fecha_fin } = {}) {
  if (!fecha_inicio) return 'La fecha de inicio es obligatoria.'

  const inicio = new Date(fecha_inicio)
  if (Number.isNaN(inicio.getTime())) return 'La fecha de inicio no es válida.'

  if (inicio.getTime() < Date.now() - TOLERANCIA_MS) {
    return 'La fecha de inicio no puede estar en el pasado.'
  }

  if (fecha_fin) {
    const fin = new Date(fecha_fin)
    if (Number.isNaN(fin.getTime())) return 'La fecha de término no es válida.'
    if (fin.getTime() <= inicio.getTime()) {
      return 'La fecha de término debe ser posterior a la de inicio.'
    }
  }

  return null
}
