  // Añade los matchers de jest-dom a `expect` (toBeInTheDocument, toHaveAttribute, etc.).
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Desmonta los componentes renderizados después de cada prueba para evitar fugas.
afterEach(() => {
  cleanup()
})
