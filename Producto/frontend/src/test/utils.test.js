import { describe, it, expect } from 'vitest'
import { formatPrecio, imgPlaceholder } from '@/core/utils'

// CONCEPTO 1: probar funciones puras (entran datos, salen datos).
// Son las pruebas más simples: no necesitan navegador ni componentes.

describe('formatPrecio', () => {
  it('devuelve "Gratis" cuando el lugar/evento es gratuito', () => {
    expect(formatPrecio(5000, true)).toBe('Gratis')
  })

  it('formatea el precio como moneda chilena (CLP)', () => {
    const resultado = formatPrecio(12500, false)
    expect(resultado).toContain('12.500')
    expect(resultado).toContain('$')
  })
})

describe('imgPlaceholder', () => {
  it('genera una URL de imagen determinística a partir de la semilla', () => {
    expect(imgPlaceholder('parque-ohiggins')).toBe(
      'https://picsum.photos/seed/parque-ohiggins/800/500',
    )
  })
})
