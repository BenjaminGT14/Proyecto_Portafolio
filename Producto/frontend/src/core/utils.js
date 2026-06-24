import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Los formateadores Intl son caros de construir, así que se crean una sola vez
// a nivel de módulo y se reutilizan en cada llamada.
const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

export function formatPrecio(precio, esGratuito) {
  if (esGratuito || precio == null || Number(precio) === 0) return 'Gratis'
  return clpFormatter.format(Number(precio))
}

const fechaHoraFormatter = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatFecha(fecha) {
  if (!fecha) return ''
  return fechaHoraFormatter.format(new Date(fecha))
}

// Placeholder determinístico: misma semilla siempre devuelve la misma imagen.
// Sirve como fallback cuando la URL real falla. Para sustituir por fotos reales
// del lugar/evento, dropear archivos en /public/lugares/ y actualizar imagen_url.
export function imgPlaceholder(seed, w = 800, h = 500) {
  const safeSeed = encodeURIComponent(String(seed || 'eventout'))
  return `https://picsum.photos/seed/${safeSeed}/${w}/${h}`
}

// Avatar determinístico tipo iniciales (DiceBear). Estable y sin 404.
export function avatarUrl(nombre) {
  const seed = encodeURIComponent(String(nombre || 'Usuario'))
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundColor=c04f23&textColor=ffffff&radius=50`
}
