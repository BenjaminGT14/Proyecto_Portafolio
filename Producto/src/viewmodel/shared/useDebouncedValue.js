import { useEffect, useState } from 'react'

/**
 * Devuelve una copia de `value` que solo se actualiza cuando deja de cambiar
 * durante `delay` ms. En el primer render devuelve el valor inicial de
 * inmediato (sin esperar el delay), así una carga inicial con filtros desde la
 * URL dispara la consulta al instante; las pulsaciones posteriores sí se
 * agrupan para no lanzar un request por tecla.
 */
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
