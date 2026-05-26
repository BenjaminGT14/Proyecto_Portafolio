import { useEffect, useState } from 'react'

/**
 * Envuelve una función async cuya respuesta es { data, error }
 * y entrega { data, loading, error } reactivos.
 * deps controla cuándo se vuelve a ejecutar (ej. los filtros).
 */
export function useAsyncData(fn, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true })

  useEffect(() => {
    let cancelled = false
    setState((prev) => ({ ...prev, loading: true }))
    fn().then((res) => {
      if (cancelled) return
      setState({
        data: res?.data ?? null,
        error: res?.error ?? null,
        loading: false,
      })
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
