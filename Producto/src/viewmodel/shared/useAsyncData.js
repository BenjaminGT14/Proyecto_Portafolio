import { useEffect, useState } from 'react'

/**
 * Envuelve una función async cuya respuesta es { data, error }
 * y entrega { data, loading, error } reactivos.
 * trigger permite forzar una recarga cuando cambia un contador externo.
 */
export function useAsyncData(fn, trigger = 0) {
  // Guardamos el resultado junto con la fn/trigger a los que pertenece. "loading"
  // se DERIVA en render (no se ajusta dentro del efecto): es true mientras el
  // resultado almacenado no corresponda a la fn/trigger actuales. Conserva el
  // dato previo mientras recarga, igual que antes.
  const [result, setResult] = useState({ data: null, error: null, fn: null, trigger: null })

  useEffect(() => {
    let cancelled = false
    fn().then((res) => {
      if (cancelled) return
      setResult({ data: res?.data ?? null, error: res?.error ?? null, fn, trigger })
    })
    return () => {
      cancelled = true
    }
  }, [fn, trigger])

  const loading = result.fn !== fn || result.trigger !== trigger
  return { data: result.data, error: result.error, loading }
}
